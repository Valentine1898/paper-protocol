// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {PaperProtocol} from "../src/PaperProtocol.sol";
import {OracleAdapter} from "../src/OracleAdapter.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {Setup} from "./Setup.sol";

contract PaperProtocolTest is Setup {
    MockERC20 public mockToken;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public owner = makeAddr("owner");

    uint256 public constant INITIAL_BALANCE = 1000 ether;
    uint256 public constant DEPOSIT_AMOUNT = 100 ether;
    uint256 public constant PRICE_TARGET = 2500 ether;

    function setUp() public override {
        vm.startPrank(owner);
        super.setUp();

        mockToken = new MockERC20("Mock Token", "MTK");

        // Set up oracle for mock token
        oracleAdapter.setOracle(
            address(mockToken),
            OracleAdapter.OracleConfig({
                oracleType: OracleAdapter.OracleType.Chainlink,
                oracleAddress: address(mockOracle),
                decimals: 8,
                heartbeat: 1 hours
            })
        );

        // Set up oracle for ETH (address(0))
        oracleAdapter.setOracle(
            address(0),
            OracleAdapter.OracleConfig({
                oracleType: OracleAdapter.OracleType.Chainlink,
                oracleAddress: address(mockOracle),
                decimals: 8,
                heartbeat: 1 hours
            })
        );

        // Set initial price for both token and ETH
        mockOracle.setPrice(int256(3000e8)); // $3000 with 8 decimals

        // Set oracle adapter in PaperProtocol
        paperProtocol.setOracleAdapter(address(oracleAdapter));

        PaperProtocol.Preset[] memory presets = new PaperProtocol.Preset[](1);
        presets[0] = PaperProtocol.Preset({
            token: address(mockToken),
            amount: DEPOSIT_AMOUNT,
            priceTarget: PRICE_TARGET
        });
        paperProtocol.setPresets(presets);

        vm.stopPrank();

        mockToken.mint(alice, INITIAL_BALANCE);
        mockToken.mint(bob, INITIAL_BALANCE);
        vm.deal(alice, INITIAL_BALANCE);
        vm.deal(bob, INITIAL_BALANCE);
    }

    function test_DepositToken() public {
        vm.startPrank(alice);
        uint256 initialBalance = mockToken.balanceOf(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(address(mockToken), DEPOSIT_AMOUNT, PRICE_TARGET);
        assertEq(mockToken.balanceOf(alice), initialBalance - DEPOSIT_AMOUNT);
        assertEq(paperProtocol.ownerOf(1), alice);
        (
            address token,
            uint256 amount,
            uint256 priceTarget,
            ,
            bool isPreset
        ) = paperProtocol.deposits(1);
        assertEq(token, address(mockToken));
        assertEq(amount, DEPOSIT_AMOUNT);
        assertEq(priceTarget, PRICE_TARGET);
        assertTrue(isPreset);
        vm.stopPrank();
    }

    function test_DepositEther() public {
        vm.startPrank(alice);
        uint256 initialBalance = alice.balance;
        paperProtocol.deposit{value: DEPOSIT_AMOUNT}(
            address(0),
            DEPOSIT_AMOUNT,
            PRICE_TARGET
        );
        assertEq(alice.balance, initialBalance - DEPOSIT_AMOUNT);
        assertEq(paperProtocol.ownerOf(1), alice);
        (
            address token,
            uint256 amount,
            uint256 priceTarget,
            ,
            bool isPreset
        ) = paperProtocol.deposits(1);
        assertEq(token, address(0));
        assertEq(amount, DEPOSIT_AMOUNT);
        assertEq(priceTarget, PRICE_TARGET);
        assertFalse(isPreset);
        vm.stopPrank();
    }

    function test_WithdrawToken() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(address(mockToken), DEPOSIT_AMOUNT, PRICE_TARGET);
        vm.stopPrank();

        // Debug prints
        uint256 currentPrice = oracleAdapter.getPrice(address(mockToken));
        console.log("Current price from oracle:", currentPrice);
        console.log("Price target:", PRICE_TARGET);

        vm.startPrank(alice);
        uint256 initialBalance = mockToken.balanceOf(alice);
        paperProtocol.withdraw(1);
        assertEq(mockToken.balanceOf(alice), initialBalance + DEPOSIT_AMOUNT);
        assertTrue(paperProtocol.isWithdrawn(1));
        vm.stopPrank();
    }

    function test_WithdrawEther() public {
        vm.startPrank(alice);
        paperProtocol.deposit{value: DEPOSIT_AMOUNT}(
            address(0),
            DEPOSIT_AMOUNT,
            PRICE_TARGET
        );
        vm.stopPrank();

        // Debug prints
        uint256 currentPrice = oracleAdapter.getPrice(address(0));
        console.log("Current price from oracle:", currentPrice);
        console.log("Price target:", PRICE_TARGET);

        vm.startPrank(alice);
        uint256 initialBalance = alice.balance;
        paperProtocol.withdraw(1);
        assertEq(alice.balance, initialBalance + DEPOSIT_AMOUNT);
        assertTrue(paperProtocol.isWithdrawn(1));
        vm.stopPrank();
    }

    function testFail_WithdrawBelowPriceTarget() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(address(mockToken), DEPOSIT_AMOUNT, PRICE_TARGET);
        vm.stopPrank();

        mockOracle.setPrice(int256(2000e8)); // $2000, 8 decimals
        vm.startPrank(alice);
        paperProtocol.withdraw(1);
    }

    function testFail_WithdrawNotOwner() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(address(mockToken), DEPOSIT_AMOUNT, PRICE_TARGET);
        vm.stopPrank();

        mockOracle.setPrice(int256(3000e8));
        vm.startPrank(bob);
        paperProtocol.withdraw(1);
    }

    function testFail_WithdrawTwice() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(address(mockToken), DEPOSIT_AMOUNT, PRICE_TARGET);
        vm.stopPrank();

        mockOracle.setPrice(int256(3000e8));
        vm.startPrank(alice);
        paperProtocol.withdraw(1);
        paperProtocol.withdraw(1);
    }

    function testFail_DepositZeroAmount() public {
        vm.startPrank(alice);
        paperProtocol.deposit(address(mockToken), 0, PRICE_TARGET);
    }

    function testFail_DepositTokenWithEther() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit{value: 1 ether}(
            address(mockToken),
            DEPOSIT_AMOUNT,
            PRICE_TARGET
        );
    }

    function test_RemovePresets() public {
        vm.startPrank(owner);
        bytes32[] memory presetIds = new bytes32[](1);
        presetIds[0] = paperProtocol.getPresetId(
            address(mockToken),
            DEPOSIT_AMOUNT,
            PRICE_TARGET
        );
        paperProtocol.removePresets(presetIds);
        PaperProtocol.Preset memory preset = paperProtocol.getPreset(
            address(mockToken),
            DEPOSIT_AMOUNT,
            PRICE_TARGET
        );
        assertFalse(paperProtocol.checkIsPreset(preset));
        vm.stopPrank();
    }
}
