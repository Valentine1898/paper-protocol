// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockOracle} from "./mocks/MockOracle.sol";
import {OracleAdapter} from "../src/OracleAdapter.sol";
import {PaperProtocol} from "../src/PaperProtocol.sol";
import {Deployer} from "../script/Deployer.sol";

contract Setup is Test {
    using Deployer for *;

    MockOracle public mockOracle;
    OracleAdapter public oracleAdapter;
    PaperProtocol public paperProtocol;

    function setUp() public virtual {
        (mockOracle, oracleAdapter, paperProtocol) = Deployer.deploy();
    }
}
