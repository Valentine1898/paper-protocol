// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MockERC20} from "test/mocks/MockERC20.sol";
import {MockOracle} from "test/mocks/MockOracle.sol";
import {OracleAdapter} from "src/OracleAdapter.sol";
import {PaperProtocol} from "src/PaperProtocol.sol";

// Deploy YELLOW and INTMAX tokens with their oracles and presets
// Usage: forge script script/DeployYellowIntmax.s.sol --rpc-url base_sepolia --verify --broadcast --slow

contract DeployYellowIntmax is Script {
    // Use existing deployed contracts
    address constant ORACLE_ADAPTER = 0x5C793701fA61433385071961f6bF8748c98c5ca9;
    address constant PAPER_PROTOCOL = 0x14C59Ba26193C65d256C41f1077c8867eB41c805;

    function run() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(privateKey);

        vm.startBroadcast(privateKey);


        console2.log("owner: ", address(owner));


        // Use existing contracts
        OracleAdapter adapter = OracleAdapter(ORACLE_ADAPTER);
        PaperProtocol protocol = PaperProtocol(PAPER_PROTOCOL);

        // Deploy YELLOW and INTMAX tokens
        MockERC20 yellowToken = new MockERC20("YELLOW", "YELLOW");
        MockERC20 intmaxToken = new MockERC20("INTMAX", "INTMAX");

        // Deploy oracles for YELLOW and INTMAX
        MockOracle yellowOracle = new MockOracle(8);
        MockOracle intmaxOracle = new MockOracle(8);

        // Set up oracle for YELLOW token (initial price $222)
        adapter.setOracle(
            address(yellowToken),
            OracleAdapter.OracleConfig({
                oracleType: OracleAdapter.OracleType.Chainlink,
                oracleAddress: address(yellowOracle),
                decimals: 8,
                heartbeat: 100 hours
            })
        );

        // Set up oracle for INTMAX token (initial price $444)
        adapter.setOracle(
            address(intmaxToken),
            OracleAdapter.OracleConfig({
                oracleType: OracleAdapter.OracleType.Chainlink,
                oracleAddress: address(intmaxOracle),
                decimals: 8,
                heartbeat: 100 hours
            })
        );

        // Set prices for oracles
        yellowOracle.setPrice(int256(222e8)); // $222 for YELLOW
        intmaxOracle.setPrice(int256(444e8)); // $444 for INTMAX

        // YELLOW Token Presets
        PaperProtocol.Preset[] memory yellowPresets = new PaperProtocol.Preset[](3);
        yellowPresets[0] = PaperProtocol.Preset({
            token: address(yellowToken),
            amount: 1000 ether,
            priceTarget: 500 ether // $500 target
        });
        yellowPresets[1] = PaperProtocol.Preset({
            token: address(yellowToken),
            amount: 5000 ether,
            priceTarget: 1000 ether // $1000 target
        });
        yellowPresets[2] = PaperProtocol.Preset({
            token: address(yellowToken),
            amount: 10000 ether,
            priceTarget: 2000 ether // $2000 target
        });

        // INTMAX Token Presets
        PaperProtocol.Preset[] memory intmaxPresets = new PaperProtocol.Preset[](3);
        intmaxPresets[0] = PaperProtocol.Preset({
            token: address(intmaxToken),
            amount: 1000 ether,
            priceTarget: 800 ether // $800 target
        });
        intmaxPresets[1] = PaperProtocol.Preset({
            token: address(intmaxToken),
            amount: 5000 ether,
            priceTarget: 1500 ether // $1500 target
        });
        intmaxPresets[2] = PaperProtocol.Preset({
            token: address(intmaxToken),
            amount: 10000 ether,
            priceTarget: 3000 ether // $3000 target
        });

        // Set presets for both tokens
        protocol.setPresets(yellowPresets);
        protocol.setPresets(intmaxPresets);

        vm.stopBroadcast();

        // Console logs
        console2.log("=== YELLOW & INTMAX DEPLOYMENT ===");
        console2.log("YELLOW Token: ", address(yellowToken));
        console2.log("INTMAX Token: ", address(intmaxToken));
        console2.log("");
        console2.log("YELLOW Oracle: ", address(yellowOracle));
        console2.log("INTMAX Oracle: ", address(intmaxOracle));
        console2.log("");
        console2.log("Oracle Adapter: ", address(adapter));
        console2.log("Paper Protocol: ", address(protocol));

        // Log preset details
        console2.log("\n=== PRESETS ===");
        console2.log("\nYELLOW Token Presets (Current Price: $222):");
        for (uint256 i = 0; i < yellowPresets.length; i++) {
            console2.log("Preset", i + 1);
            console2.log("  Amount:", yellowPresets[i].amount);
            console2.log("  Price Target:", yellowPresets[i].priceTarget);
        }

        console2.log("\nINTMAX Token Presets (Current Price: $444):");
        for (uint256 i = 0; i < intmaxPresets.length; i++) {
            console2.log("Preset", i + 1);
            console2.log("  Amount:", intmaxPresets[i].amount);
            console2.log("  Price Target:", intmaxPresets[i].priceTarget);
        }

        console2.log("\n=== SUMMARY ===");
        console2.log("YELLOW: 222$ -> targets: 500$, 1000$, 2000$");
        console2.log("INTMAX: 444$ -> targets: 800$, 1500$, 3000$");
    }
} 