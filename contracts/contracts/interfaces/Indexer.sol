// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface Indexer {

    function AddPaymaster(
        address safeAddress,
        string memory safeMetadata
    ) external;

    function UpdatePaymaster(
        address safeAddress,
        string memory safeMetadata
    ) external;
}

interface SafeOwners {
    function isOwner(address owner) external view returns (bool);
}