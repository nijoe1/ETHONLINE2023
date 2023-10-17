// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {_getFeeCollectorRelayContext, _getFeeTokenRelayContext, _getFeeRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "@sismo-core/sismo-connect-solidity/contracts/SismoConnectLib.sol";
import {EIP1271Verifier} from "./EIP1271/EIP1271Verifier.sol";

interface SafeOwners {
    function isOwner(address owner) external view returns (bool);
}

contract SafePaymasterPlugin is BasePluginWithEventMetadata, SismoConnect, EIP1271Verifier {

    error FeePaymentFailure(bytes data);
    error UntrustedOrigin(address origin);
    error RelayExecutionFailure(bytes data);
    error InvalidRelayMethod(bytes4 data);
    error NotPaymasterOwner();
    
    address constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    address public immutable trustedOrigin;

    using SismoConnectHelper for SismoConnectVerifiedResult;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct GuardInfo{
        ClaimRequest[] claims;
        EnumerableSet.Bytes32Set contractAllowedMethods;
        mapping(bytes32 => uint256) timesPerAddress;
        uint256 allowedTimesPerAddress;
        string guardMetadataCID;
    }

    mapping(address => mapping(address => GuardInfo)) safeGuard;

    constructor(
        address _trustedOrigin,
        bytes16 appId
    )   EIP1271Verifier("ZKSafePaymaster", "0.0.1")
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
        trustedOrigin = _trustedOrigin;
    }

    function setAllowedInteractions(
        address safeAddress,
        address contractAddress,
        bytes4[] calldata  methods,
        ClaimRequest[] calldata _claims,
        uint256 _timesPerAddress,
        string memory guardMetadataCID  
    )external{
        if(!SafeOwners(safeAddress).isOwner(msg.sender)) revert NotPaymasterOwner();
        GuardInfo storage _safeGuard = safeGuard[safeAddress][contractAddress];
        for (uint i = 0; i < methods.length; ) {
            _safeGuard.contractAllowedMethods.add(methods[i]);
            unchecked {
                ++i;
            }
        }
        for (uint j = 0; j < _claims.length; ) {
            _safeGuard.claims.push(_claims[j]);
            unchecked {
                ++j;
            }
        }
        _safeGuard.allowedTimesPerAddress = _timesPerAddress;
        _safeGuard.guardMetadataCID = guardMetadataCID;
    }

    function payFee(ISafeProtocolManager manager, ISafe safe, uint256 nonce) internal {
        address feeCollector = _getFeeCollectorRelayContext();
        address feeToken = _getFeeTokenRelayContext();
        uint256 fee = _getFeeRelayContext();
        SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
        // uint256 maxFee = maxFeePerToken[address(safe)][feeToken];
        // if (fee > maxFee) revert FeeTooHigh(feeToken, fee);
        if (feeToken == NATIVE_TOKEN || feeToken == address(0)) {
            // If the native token is used for fee payment, then we directly send the fees to the fee collector
            actions[0].to = payable(feeCollector);
            actions[0].value = fee;
            actions[0].data = "";
        } else {
            // If a ERC20 token is used for fee payment, then we trigger a token transfer on the token for the fee to the fee collector
            actions[0].to = payable(feeToken);
            actions[0].value = 0;
            actions[0].data = abi.encodeWithSignature("transfer(address,uint256)", feeCollector, fee);
        }
        // Note: Metadata format has not been proposed
        SafeTransaction memory safeTx = SafeTransaction({actions: actions, nonce: nonce, metadataHash: bytes32(0)});
        try manager.executeTransaction(safe, safeTx) returns (bytes[] memory) {} catch (bytes memory reason) {
            revert FeePaymentFailure(reason);
        }
    }

    function relayCall(
        ISafeProtocolManager manager,
        ISafe safe, 
        SafeTransaction calldata  safetx,
        bytes[] memory proofs,
        address relayFor
    ) internal {

        uint size = safetx.actions.length;

        for(uint i = 0; i < size; i++){
            SafeProtocolAction memory _action = safetx.actions[i];
            bytes4 relayData = bytes4(safetx.actions[i].data[:4]);
            GuardInfo storage SafeGuard = safeGuard[address(safe)][_action.to]; 
            if(SafeGuard.contractAllowedMethods.contains(relayData)) revert InvalidRelayMethod(relayData);
            if (SafeGuard.claims.length > 0) {
                // We use the hash of the tx to relay has a nonce as this is unique

                // TODO Create a signature recover with typed data so that only the signer can make that transaction 
                // with his sismo proof only if the signed deadline is constrained allowed so that others cannot execute
                // others free sponsored transactions
                // address recoveredTypedDataAddress;
                // uint256 signatureDeadlineActivness;

                // TODO hold all the transaction info into the typed data message so that only this one can get executed 
                // { manager - safe - SafeTransaction - bytes[] proofs } typeddata signed txt so we also only passing that as an 
                // input decoding and good to go !!!

                // Verifying Claims
                verifySismoClaims(proofs[i], relayFor, SafeGuard.claims);
            }
            uint256 allowedTimes = SafeGuard.allowedTimesPerAddress;
            bytes32 uid = keccak256(abi.encode(relayData,_action.to));
            require(allowedTimes > SafeGuard.timesPerAddress[uid]);
            SafeGuard.timesPerAddress[uid]++;
        }

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
            // we are using tx.origin here because it is called from a different 
            // contract using an interface from a caller and he is the tx.origin  
            signature: buildSignature({message: abi.encode(relayFor)})
        });

        // require(!takenNonces[nonce], "already executed transaction");
        require(result.claims.length == requestRequiredClaims.length, "failed");

        // takenNonces[nonce] = true;
    }

    function executeFromPlugin(
        ISafeProtocolManager manager, 
        ISafe safe,
        SafeTransaction calldata safetx,
        bytes[] memory proofs,
        address relayFor
    ) external {
        if (trustedOrigin != address(0) && msg.sender != trustedOrigin) revert UntrustedOrigin(msg.sender);
        // We use the hash of the tx to relay has a nonce as this is unique
        uint256 nonce = uint256(keccak256(abi.encode(this, manager, safe, safetx.actions[0].data)));

        relayCall(manager, safe, safetx, proofs, relayFor);

        payFee(manager, safe, nonce);
    }
}
