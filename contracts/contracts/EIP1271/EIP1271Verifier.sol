// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

// prettier-ignore
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";


import {DeadlineExpired, NO_EXPIRATION_TIME, Signature, InvalidSignature} from "../common/Constants.sol";

/// @title EIP1271Verifier
/// @notice EIP1271Verifier typed signatures verifier for EAS delegated attestations.
abstract contract EIP1271Verifier is EIP712 {
    using Address for address;

    // The hash of the data type used to relay calls to the attest function. It's the value of
    // keccak256("Attest(bytes32 schema,address recipient,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data,uint256 value,uint256 nonce,uint64 deadline)").
    bytes32 private constant SPONSOR_TX_TYPEHASH =
        0xf83bb2b0ede93a840239f7e701a54d9bc35f03701f51ae153d601c6947ff3d3f;

    // The user readable name of the signing domain.
    string private _name;

    /// @dev Creates a new EIP1271Verifier instance.
    /// @param version The current major version of the signing domain
    constructor(
        string memory name,
        string memory version
    ) EIP712(name, version) {
        _name = name;
    }

    /// @notice Returns the domain separator used in the encoding of the signatures for attest, and revoke.
    /// @return The domain separator used in the encoding of the signatures for attest, and revoke.
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /// @notice Returns the EIP712 type hash for the attest function.
    /// @return The EIP712 type hash for the attest function.
    function getSponsorTxTypeHash() external pure returns (bytes32) {
        return SPONSOR_TX_TYPEHASH;
    }

    /// @notice Returns the EIP712 name.
    /// @return The EIP712 name.
    function getName() external view returns (string memory) {
        return _name;
    }
/// @notice A struct representing the full arguments of the full delegated attestation request.
struct DelegatedTransactionRequest {
    bytes32 schema; // The unique identifier of the schema.
    SafeTransaction safetx; // The arguments of the attestation request.
    bytes[] proofs;
    Signature signature; // The ECDSA signature data.
    address relayFor; // The attesting account.
    uint64 deadline; // The deadline of the signature/request.
}

    /// @dev Verifies delegated attestation request.
    /// @param request The arguments of the delegated attestation request.
    function _verifySponsoredTransaction(
        DelegatedTransactionRequest memory request
    ) internal view {
        if (
            request.deadline != NO_EXPIRATION_TIME &&
            request.deadline <= _time()
        ) {
            revert DeadlineExpired();
        }

        SafeTransaction memory txt = request.safetx;
        Signature memory signature = request.signature;

        bytes32 hash = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    SPONSOR_TX_TYPEHASH,
                    txt.actions[0].to,
                    txt.actions[0].value,
                    txt.actions[0].to,
                    keccak256(txt.actions[0].data),
                    keccak256(request.proofs[0]),
                    request.deadline
                )
            )
        );
        if (
            !SignatureChecker.isValidSignatureNow(
                request.relayFor,
                hash,
                abi.encodePacked(signature.r, signature.s, signature.v)
            )
        ) {
            revert InvalidSignature();
        }
    }



    /// @dev Returns the current's block timestamp. This method is overridden during tests and used to simulate the
    ///     current block time.
    function _time() internal view virtual returns (uint64) {
        return uint64(block.timestamp);
    }
}