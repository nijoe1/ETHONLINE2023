// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";

import {
    GelatoRelayContextERC2771
} from "@gelatonetwork/relay-context/contracts/GelatoRelayContextERC2771.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";


import "@sismo-core/sismo-connect-solidity/contracts/SismoConnectLib.sol";

import { Indexer, SafeOwners } from "./interfaces/Indexer.sol";

contract SafePaymasterPlugin is BasePluginWithEventMetadata, SismoConnect, GelatoRelayContextERC2771  {

    Indexer indexer;

    error FeePaymentFailure(bytes data);
    error UntrustedOrigin(address origin);
    error RelayExecutionFailure(bytes data);
    error InvalidRelayMethod(bytes4 data);
    error InvalidRelayTarget();
    error NotPaymasterOwner();
    error onlyOneTransactionEachTime();
    error invalidZKProof();
    
    address constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    using SismoConnectHelper for SismoConnectVerifiedResult;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct GuardInfo{
        ClaimRequest[] claims;
        EnumerableSet.Bytes32Set contractAllowedMethods;
        mapping(bytes32 => uint256) timesPerAddress;
        uint256 allowedTimesPerAddress;
    }

    mapping(address => EnumerableSet.AddressSet) safeWhitelistedContracts;

    mapping(bytes32 => GuardInfo) safeGuard;

    constructor(
        Indexer _indexer,
        bytes16 appId
    )   GelatoRelayContextERC2771()
        SismoConnect(buildConfig(appId))
        BasePluginWithEventMetadata(
        PluginMetadata({
            name: "Test Plugin",
            version: "1.0.0",
            requiresRootAccess: false,
            iconUrl: "",
            appUrl: string.concat("https://nijoe1.github.io/Safe.Paymaster/#/relay/",Strings.toHexString(address(this)))
            })
        )
    {
        indexer = _indexer;
    }

    function setAllowedInteractions(
        address safeAddress,
        address contractAddress,
        bytes4[] calldata  methods,
        ClaimRequest[] calldata _claims,
        uint256 _timesPerAddress,
        string memory guardMetadataCID  
    )external{
        // To secure the Safe Multisig Wallet
        if(!SafeOwners(safeAddress).isOwner(msg.sender)) revert NotPaymasterOwner();

        if(safeWhitelistedContracts[safeAddress].length() == 0){
            indexer.AddPaymaster(safeAddress, guardMetadataCID);
        }else{
            indexer.UpdatePaymaster(safeAddress, guardMetadataCID);
        }

        safeWhitelistedContracts[safeAddress].add(contractAddress);

        bytes32 uid = keccak256(abi.encode(safeAddress,contractAddress));

        GuardInfo storage SafeGuard = safeGuard[uid];

        // Adding the allowed methods
        for (uint i = 0; i < methods.length; ) {
            SafeGuard.contractAllowedMethods.add(methods[i]);
            unchecked {
                ++i;
            }
        }
        // Adding the required ZK proofs to allow sponsoring the transaction
        for (uint j = 0; j < _claims.length; ) {
            SafeGuard.claims.push(_claims[j]);
            unchecked {
                ++j;
            }
        }
        SafeGuard.allowedTimesPerAddress = _timesPerAddress;
    }

    function executeFromPlugin(
        ISafeProtocolManager manager, 
        ISafe safe,
        SafeTransaction calldata safetx,
        bytes memory proofs
    ) external onlyGelatoRelayERC2771{
        // if (trustedOrigin != address(0) && msg.sender != trustedOrigin) revert UntrustedOrigin(msg.sender);
        // We use the hash of the tx to relay has a nonce as this is unique
        uint256 nonce = uint256(keccak256(abi.encode(_getMsgSender(), manager, safe, safetx.actions[0].data)));

        relayCall(manager, safe, safetx, proofs);

        payFee(manager, safe, nonce);
    }

    function relayCall(
        ISafeProtocolManager manager,
        ISafe safe, 
        SafeTransaction calldata  safetx,
        bytes memory proofs
    ) internal {

        uint size = safetx.actions.length;
        if(size > 1 ){
            revert onlyOneTransactionEachTime();
        }

        SafeProtocolAction memory _action = safetx.actions[0];
            
        bytes32 relayData = bytes4(safetx.actions[0].data[:4]);

        bool allowedContract = safeWhitelistedContracts[address(safe)].contains(_action.to);

        if(!allowedContract) revert InvalidRelayTarget();

        bytes32 uid = keccak256(abi.encode(address(safe), _action.to));
            
        GuardInfo storage SafeGuard = safeGuard[uid]; 
            
        if(SafeGuard.contractAllowedMethods.contains(relayData)) revert InvalidRelayMethod(bytes4(relayData));
           
        if (SafeGuard.claims.length > 0) {
            // Verifying Claims
            verifySismoClaims(proofs, _getMsgSender(), SafeGuard.claims);
        }
            
        SafeGuard.allowedTimesPerAddress;
            
        uid = keccak256(abi.encode(relayData,_action.to));
            
        require(SafeGuard.allowedTimesPerAddress > SafeGuard.timesPerAddress[uid]);
        
        SafeGuard.timesPerAddress[uid]++;
        
        // Perform relay call and require success to avoid that user paid for failed transaction
        try manager.executeTransaction(safe, safetx) returns (bytes[] memory) {} catch (bytes memory reason) {
            revert RelayExecutionFailure(reason);
        }
    }

    function verifySismoClaims(
        bytes memory sismoConnectResponseProofs,
        address relayFor,
        ClaimRequest[] memory requestRequiredClaims
    ) public view{
        AuthRequest[] memory auths = new AuthRequest[](1);
        auths[0] = buildAuth({authType: AuthType.VAULT});

        SismoConnectVerifiedResult memory result = verify({
            responseBytes: sismoConnectResponseProofs,
            auths: auths,
            claims: requestRequiredClaims,
            signature: buildSignature({message: abi.encode(relayFor)})
        });

        if(result.claims.length == requestRequiredClaims.length) revert invalidZKProof();
    }

        function payFee(ISafeProtocolManager manager, ISafe safe, uint256 nonce) internal {        

        SafeTransaction memory safeTx = getFeesTransferTxData(_getFeeToken(),_getFeeCollector(),_getFee(),nonce);
        try manager.executeTransaction(safe, safeTx) returns (bytes[] memory) {} catch (bytes memory reason) {
            revert FeePaymentFailure(reason);
        }
    }

    function getFeesTransferTxData(
        address _token,
        address _to,
        uint256 _amount,
        uint256 _nonce
    ) internal pure returns(SafeTransaction memory transaction) {
        SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);

        if (_token == NATIVE_TOKEN || _token == address(0)) {
            // If the native token is used for fee payment, then we directly send the fees to the fee collector
            actions[0].to = payable(_to);
            actions[0].value = _amount;
            actions[0].data = "";
        } else {
            // If a ERC20 token is used for fee payment, then we trigger a token transfer on the token for the fee to the fee collector
            actions[0].to = payable(_token);
            actions[0].value = 0;
            actions[0].data = abi.encodeWithSignature("transfer(address,uint256)", _to, _amount);
        }
        return SafeTransaction({actions: actions, nonce: _nonce, metadataHash: bytes32(0)});
    }
}
