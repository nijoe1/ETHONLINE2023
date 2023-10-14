// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {_getFeeCollectorRelayContext, _getFeeTokenRelayContext, _getFeeRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/ISismoVerifier.sol";
import "./interfaces/ISismoStructs.sol";
address constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

interface SafeOwners {
    function isOwner(address owner) external view returns (bool);
}

contract SafePaymasterPlugin is BasePluginWithEventMetadata, ISismoStructs {

    error FeePaymentFailure(bytes data);
    error UntrustedOrigin(address origin);
    error RelayExecutionFailure(bytes data);
    error InvalidRelayMethod(bytes4 data);
    error NotPaymasterOwner();

    address public immutable trustedOrigin;

    ISismoVerifier sismoVerifier;

    struct SafeGuard{
        // ContractAddress => method => allowedMethod
        mapping(address => mapping(bytes4 => bool)) allowedCalls;
        // ContractAddress => method => allowedCallsByUser
        mapping(address => mapping(bytes4 => uint256)) userAllowancePerMethod;

        mapping(address=> mapping(bytes4 => GuardParams)) guardMap;
    }

    struct GuardParams{
        ClaimRequest[] claims;
        bool allowedMethod;
        uint256 timesPerAddress;
    }

    mapping(address => SafeGuard) safeGuard;

    constructor(
        ISismoVerifier _sismoVerifier,
        address _trustedOrigin
    )
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
        sismoVerifier = _sismoVerifier;
        trustedOrigin = _trustedOrigin;
    }

    function setAllowedInteractions(
        address safeAddress,
        address contractAddress,
        bytes4 method,
        ClaimRequest[] memory _claims   
    )external{
        if(!SafeOwners(safeAddress).isOwner(msg.sender)) revert NotPaymasterOwner();
        safeGuard[safeAddress].allowedCalls[contractAddress][method] = true;
        for (uint i = 0; i < _claims.length; ) {
            safeGuard[safeAddress].guardMap[contractAddress][method].claims.push(_claims[i]);
            unchecked {
                ++i;
            }
        }
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
        SafeTransaction calldata safetx,
        bytes[] memory proofs
    ) internal {

        uint size = safetx.actions.length;

        for(uint i = 0; i < size; i++){
            bytes4 relayData = bytes4(safetx.actions[i].data[:4]);
            if(safeGuard[address(safe)].allowedCalls[safetx.actions[i].to][relayData])revert InvalidRelayMethod(relayData);
            if (safeGuard[address(safe)].guardMap[safetx.actions[i].to][relayData].claims.length > 0) {
                sismoVerifier.verifySismoProof(proofs[i], safeGuard[address(safe)].guardMap[safetx.actions[i].to][relayData].claims);
            }
        }

        // Perform relay call and require success to avoid that user paid for failed transaction
        try manager.executeTransaction(safe, safetx) returns (bytes[] memory) {} catch (bytes memory reason) {
            revert RelayExecutionFailure(reason);
        }
    }

    function executeFromPlugin(
        ISafeProtocolManager manager, 
        ISafe safe,
        SafeTransaction calldata safetx,
        bytes[] memory proofs
    ) external {
        if (trustedOrigin != address(0) && msg.sender != trustedOrigin) revert UntrustedOrigin(msg.sender);
        // Verifying Claims
        
        relayCall(manager, safe, safetx,proofs);
        // We use the hash of the tx to relay has a nonce as this is unique
        uint256 nonce = uint256(keccak256(abi.encode(this, manager, safe, safetx.actions[0].data)));
        payFee(manager, safe, nonce);
    }
}
