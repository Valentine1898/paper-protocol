// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {OracleAdapter} from "src/OracleAdapter.sol";
import {MockOracle} from "test/mocks/MockOracle.sol";

// Don't forget to use `source .env`
// forge script script/ChangeEthMockOracle.s.sol --rpc-url base_sepolia --verify --broadcast --slow --sig "run(address)" 0xb580Bbc11d8Af009D1235E4601CB3B500B2E7da1
contract ChangeEthMockOracle is Script {
    function run(address oracleAdapterAddress) public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(privateKey);

        // Deploy new MockOracle with 8 decimals (standard for Chainlink price feeds)
        MockOracle mockOracle = new MockOracle(8);

        // Set initial ETH price to $2500
        mockOracle.setPrice(int256(2500e8));

        OracleAdapter oracleAdapter = OracleAdapter(oracleAdapterAddress);

        OracleAdapter.OracleConfig memory config = OracleAdapter.OracleConfig({
            oracleType: OracleAdapter.OracleType.Chainlink,
            oracleAddress: address(mockOracle),
            decimals: 8,
            heartbeat: 100 hours
        });

        oracleAdapter.setOracle(address(0), config);

        vm.stopBroadcast();
    }
}
