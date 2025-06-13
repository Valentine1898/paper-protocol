// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MockERC20} from "test/mocks/MockERC20.sol";
import {MockOracle} from "test/mocks/MockOracle.sol";
import {OracleAdapter} from "src/OracleAdapter.sol";
import {PaperProtocol} from "src/PaperProtocol.sol";

import {Deployer} from "script/Deployer.sol";

// don't forget to use `source .env`
// forge script script/Deploy.s.sol --rpc-url base_sepolia --verify --broadcast --slow

contract Deploy is Script {
    function run() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(privateKey);

        vm.startBroadcast(privateKey);

        OracleAdapter adapter = Deployer.deployOracleAdapter();
        PaperProtocol protocol = Deployer.deployPaperProtocol();

        MockERC20 mockToken = new MockERC20("Mock Token", "MTK");

        MockOracle mockTokenOracle = new MockOracle(8);
        MockOracle ethOracle = new MockOracle(8);

        // Set up oracle for mock token (initial price $1)
        adapter.setOracle(
            address(mockToken),
            OracleAdapter.OracleConfig({
                oracleType: OracleAdapter.OracleType.Chainlink,
                oracleAddress: address(mockTokenOracle),
                decimals: 8,
                heartbeat: 100 hours
            })
        );

        // Set up oracle for native token (initial price $2000)
        adapter.setOracle(
            address(0),
            OracleAdapter.OracleConfig({
                oracleType: OracleAdapter.OracleType.Chainlink,
                oracleAddress: address(ethOracle),
                decimals: 8,
                heartbeat: 100 hours
            })
        );

        // Set prices for each oracle
        mockTokenOracle.setPrice(int256(1e8)); // $1 for mock token
        ethOracle.setPrice(int256(2000e8)); // $2000 for ETH

        protocol.setOracleAdapter(address(adapter));

        PaperProtocol.Preset[] memory tokenPresets = new PaperProtocol.Preset[](
            3
        );
        tokenPresets[0] = PaperProtocol.Preset({
            token: address(mockToken),
            amount: 100 ether,
            priceTarget: 1.5 ether // $1.5 target (50% increase)
        });
        tokenPresets[1] = PaperProtocol.Preset({
            token: address(mockToken),
            amount: 100 ether,
            priceTarget: 2 ether // $2 target (100% increase)
        });
        tokenPresets[2] = PaperProtocol.Preset({
            token: address(mockToken),
            amount: 100 ether,
            priceTarget: 3 ether // $3 target (200% increase)
        });

        // Set up presets for native token with increasing price targets
        PaperProtocol.Preset[] memory ethPresets = new PaperProtocol.Preset[](
            3
        );
        ethPresets[0] = PaperProtocol.Preset({
            token: address(0),
            amount: 0.001 ether,
            priceTarget: 3000 ether // $3000 target (50% increase)
        });
        ethPresets[1] = PaperProtocol.Preset({
            token: address(0),
            amount: 0.01 ether,
            priceTarget: 4000 ether // $4000 target (100% increase)
        });
        ethPresets[2] = PaperProtocol.Preset({
            token: address(0),
            amount: 0.05 ether,
            priceTarget: 6000 ether // $6000 target (200% increase)
        });

        // Set all presets
        protocol.setPresets(tokenPresets);
        protocol.setPresets(ethPresets);

        vm.stopBroadcast();

        console2.log("Mock Token: ", address(mockToken));
        console2.log("Mock Token Oracle: ", address(mockTokenOracle));
        console2.log("ETH Oracle: ", address(ethOracle));
        console2.log("Adapter: ", address(adapter));
        console2.log("Protocol: ", address(protocol));

        // Log preset details
        console2.log("\nMock Token Presets:");
        for (uint256 i = 0; i < tokenPresets.length; i++) {
            console2.log("Preset", i + 1);
            console2.log("  Amount:", tokenPresets[i].amount);
            console2.log("  Price Target:", tokenPresets[i].priceTarget);
        }

        console2.log("\nETH Presets:");
        for (uint256 i = 0; i < ethPresets.length; i++) {
            console2.log("Preset", i + 1);
            console2.log("  Amount:", ethPresets[i].amount);
            console2.log("  Price Target:", ethPresets[i].priceTarget);
        }
    }
}
