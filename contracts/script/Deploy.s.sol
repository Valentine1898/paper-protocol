// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {OracleAdapter} from "src/OracleAdapter.sol";
import {PaperProtocol} from "src/PaperProtocol.sol";
import {Deployer} from "script/Deployer.sol";
import {MockOracle} from "test/mocks/MockOracle.sol";

// don't forget to use `source .env`
// forge script script/Deploy.s.sol --rpc-url base_sepolia --verify --broadcast --slow

contract Deploy is Script {
    function run() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(privateKey);

        vm.startBroadcast(privateKey);

        // Deploy all contracts using Deployer
        (
            MockOracle oracle,
            OracleAdapter adapter,
            PaperProtocol protocol
        ) = Deployer.deploy();

        // Set initial ETH price to $2000
        oracle.setPrice(int256(2000e8));

        vm.stopBroadcast();

        console2.log("Adapter: ", address(adapter));
        console2.log("Protocol: ", address(protocol));
        console2.log("Mock ETH Oracle: ", address(oracle));
    }
}
