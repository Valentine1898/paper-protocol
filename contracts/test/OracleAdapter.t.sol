// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Setup} from "./Setup.sol";
import {OracleAdapter} from "../src/OracleAdapter.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract OracleAdapterTest is Setup {
    address constant ETH = address(0);

    function test_InitialPrice() public {
        uint256 price = oracleAdapter.getPrice(ETH);
        assertEq(price, 2000e18); // Initial price is $2000 with 18 decimals
    }

    function test_PriceUpdate() public {
        // Update price to $2500
        mockOracle.setPrice(2500e8);

        uint256 price = oracleAdapter.getPrice(ETH);
        assertEq(price, 2500e18);
    }

    function test_StalePrice() public {
        // Move time forward past heartbeat
        vm.warp(block.timestamp + 2 hours);

        vm.expectRevert(OracleAdapter.StalePrice.selector);
        oracleAdapter.getPrice(ETH);
    }

    function test_InvalidOracle() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OracleAdapter.OracleNotSet.selector,
                address(1)
            )
        );
        oracleAdapter.getPrice(address(1)); // Non-existent token
    }

    function test_SetOracle() public {
        address newOracle = address(0x123);
        OracleAdapter.OracleConfig memory config = OracleAdapter.OracleConfig({
            oracleType: OracleAdapter.OracleType.Chainlink,
            oracleAddress: newOracle,
            decimals: 8,
            heartbeat: 1 hours
        });

        oracleAdapter.setOracle(ETH, config);

        // Verify oracle was set
        (
            OracleAdapter.OracleType oracleType,
            address oracleAddress,
            uint8 decimals,
            uint256 heartbeat
        ) = oracleAdapter.getOracle(ETH);

        assertEq(uint8(oracleType), uint8(OracleAdapter.OracleType.Chainlink));
        assertEq(oracleAddress, newOracle);
        assertEq(decimals, 8);
        assertEq(heartbeat, 1 hours);
    }

    function test_SetOracle_OnlyOwner() public {
        vm.prank(address(1)); // Switch to non-owner address

        OracleAdapter.OracleConfig memory config = OracleAdapter.OracleConfig({
            oracleType: OracleAdapter.OracleType.Chainlink,
            oracleAddress: address(0x123),
            decimals: 8,
            heartbeat: 1 hours
        });

        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                address(1)
            )
        );
        oracleAdapter.setOracle(ETH, config);
    }

    function test_ZeroPrice() public {
        mockOracle.setPrice(0);

        vm.expectRevert(OracleAdapter.InvalidPrice.selector);
        oracleAdapter.getPrice(ETH);
    }

    function test_NegativePrice() public {
        mockOracle.setPrice(-1000e8);

        vm.expectRevert(OracleAdapter.InvalidPrice.selector);
        oracleAdapter.getPrice(ETH);
    }
}
