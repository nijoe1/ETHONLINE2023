// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

contract Test {
    uint256 public value;

    function updateValue(
        uint val
    ) external {
        value = val;
    }

    function getMoney()public payable{}

    function withdraw()public{
        address payable to = payable(msg.sender);
        to.transfer(address(this).balance);
    }
}
