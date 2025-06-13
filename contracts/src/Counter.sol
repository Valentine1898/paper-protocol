// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract Counter is ERC20 {
    uint256 public number;

    constructor() ERC20("Counter", "CTR") {
        _mint(msg.sender, 1000000000000000000000000);
    }

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
