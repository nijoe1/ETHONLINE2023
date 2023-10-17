// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

// Plugin permissions
uint8 constant PLUGIN_PERMISSION_NONE = 0;
uint8 constant PLUGIN_PERMISSION_EXECUTE_CALL = 1;
uint8 constant PLUGIN_PERMISSION_CALL_TO_SELF = 2;
uint8 constant PLUGIN_PERMISSION_EXECUTE_DELEGATECALL = 4;

// Module types
uint8 constant MODULE_TYPE_PLUGIN = 1;
uint8 constant MODULE_TYPE_FUNCTION_HANDLER = 2;
uint8 constant MODULE_TYPE_HOOKS = 4;

// A representation of an empty/uninitialized UID.
bytes32 constant EMPTY_UID = 0;

// A zero expiration represents an non-expiring attestation.
uint64 constant NO_EXPIRATION_TIME = 0;

error DeadlineExpired();
error InvalidSignature();

/// @notice A struct representing ECDSA signature data.
struct Signature {
    uint8 v; // The recovery ID.
    bytes32 r; // The x-coordinate of the nonce R.
    bytes32 s; // The signature data.
}
