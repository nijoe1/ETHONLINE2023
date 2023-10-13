// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {_getFeeCollectorRelayContext, _getFeeTokenRelayContext, _getFeeRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

address constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

contract RelayPlugin is BasePluginWithEventMetadata {
    event MaxFeeUpdated(address indexed account, address indexed feeToken, uint256 maxFee);

    error FeeTooHigh(address feeToken, uint256 fee);
    error FeePaymentFailure(bytes data);
    error UntrustedOrigin(address origin);
    error RelayExecutionFailure(bytes data);
    error InvalidRelayMethod(bytes4 data);

    address public immutable trustedOrigin;

    // Account => token => maxFee
    mapping(address => mapping(address => uint256)) public maxFeePerToken;

    struct SafeGuard{
        mapping(address => mapping(bytes4 => bool)) allowedCalls;
    }

    mapping(address => SafeGuard) safeGuard;

    constructor(
        address _trustedOrigin
    )
        BasePluginWithEventMetadata(
            PluginMetadata({
                name: "Paymaster Plugin",
                version: "1.0.0",
                requiresRootAccess: false,
                iconUrl: "",
                appUrl: "https://5afe.github.io/safe-core-protocol-demo/#/relay/${plugin}"
            })
        )
    {
        trustedOrigin = _trustedOrigin;
    }

    function setMaxFeePerToken(address token, uint256 maxFee) external {
        maxFeePerToken[msg.sender][token] = maxFee;
        emit MaxFeeUpdated(msg.sender, token, maxFee);
    }

    function payFee(ISafeProtocolManager manager, ISafe safe, uint256 nonce) internal {
        address feeCollector = _getFeeCollectorRelayContext();
        address feeToken = _getFeeTokenRelayContext();
        uint256 fee = _getFeeRelayContext();
        SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
        uint256 maxFee = maxFeePerToken[address(safe)][feeToken];
        if (fee > maxFee) revert FeeTooHigh(feeToken, fee);
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
        SafeTransaction calldata safetx
    ) internal {

        bytes4 relayData = bytes4(safetx.actions[0].data[:4]);

        if(safeGuard[address(safe)].allowedCalls[safetx.actions[0].to][relayData])revert InvalidRelayMethod(relayData);

        // Perform relay call and require success to avoid that user paid for failed transaction
        try manager.executeTransaction(safe, safetx) returns (bytes[] memory) {} catch (bytes memory reason) {
            revert RelayExecutionFailure(reason);
        }
    }

    function executeFromPlugin(
        ISafeProtocolManager manager, 
        ISafe safe,
        SafeTransaction calldata safetx
    ) external {
        if (trustedOrigin != address(0) && msg.sender != trustedOrigin) revert UntrustedOrigin(msg.sender);

        relayCall(manager, safe, safetx);
        // We use the hash of the tx to relay has a nonce as this is unique
        uint256 nonce = uint256(keccak256(abi.encode(this, manager, safe, safetx.actions[0].data)));
        payFee(manager, safe, nonce);
    }
}
