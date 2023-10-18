// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {TablelandDeployments, ITablelandTables} from "@tableland/evm/contracts/utils/TablelandDeployments.sol";

import {SQLHelpers} from "@tableland/evm/contracts/utils/SQLHelpers.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ZKSafePaymasterIndexer is Ownable {

    ITablelandTables private tablelandContract;

    string[] createTableStatements;

    string[] public tables;

    uint256[] tableIDs;

    string private constant PAYMASTER_TABLE_PREFIX = "paymaster_safes";

    string private constant PAYMASTER_SCHEMA = "safeAddress text, safeMetadata text";

    constructor() {
        tablelandContract = TablelandDeployments.get();

        createTableStatements.push(
            SQLHelpers.toCreateFromSchema(
                PAYMASTER_SCHEMA,
                PAYMASTER_TABLE_PREFIX
            )
        );

        tableIDs = tablelandContract.create(
            address(this),
            createTableStatements
        );

        tables.push(
            SQLHelpers.toNameFromId(PAYMASTER_TABLE_PREFIX, tableIDs[0])
        );
    }

    function AddPaymaster(
        address safeAddress,
        string memory safeMetadata
    ) public onlyOwner {
        mutate(
            tableIDs[0],
            SQLHelpers.toInsert(
                PAYMASTER_TABLE_PREFIX,
                tableIDs[0],
                "safeAddress, safeMetadata",
                string.concat(
                    SQLHelpers.quote(Strings.toHexString(safeAddress)),
                    ",",
                    SQLHelpers.quote(safeMetadata)
                )
            )
        );
    }

    function UpdatePaymaster(
        address safeAddress,
        string memory safeMetadata
    ) public onlyOwner {
        mutate(
            tableIDs[0],
            SQLHelpers.toUpdate(
                PAYMASTER_TABLE_PREFIX,
                tableIDs[0],
                string.concat(
                    "safeMetadata=",
                    SQLHelpers.quote(safeMetadata)
                ),
                string.concat(
                    "safeAddress=",
                    SQLHelpers.quote(Strings.toHexString(safeAddress))
                )
            )
        );
    }

    /*
     * @dev Internal function to execute a mutation on a table.
     * @param {uint256} tableId - Table ID.
     * @param {string} statement - Mutation statement.
     */
    function mutate(uint256 tableId, string memory statement) internal {
        tablelandContract.mutate(address(this), tableId, statement);
    }
}