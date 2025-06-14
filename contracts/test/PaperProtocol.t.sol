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
    uint256 public constant INITIAL_PRICE = 2000 ether; // Lower than PRICE_TARGET

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
        // OracleAdapter converts 8 decimals to 18 decimals internally
        mockOracle.setPrice(int256(INITIAL_PRICE / 1e10)); // Convert to 8 decimals

        // Set oracle adapter in PaperProtocol
        paperProtocol.setOracleAdapter(address(oracleAdapter));

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
            uint256 priceAtDeposit,
            uint256 priceTarget,

        ) = paperProtocol.deposits(1);
        assertEq(token, address(mockToken));
        assertEq(amount, DEPOSIT_AMOUNT);
        assertEq(priceAtDeposit, INITIAL_PRICE);
        assertEq(priceTarget, PRICE_TARGET);
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
            uint256 priceAtDeposit,
            uint256 priceTarget,

        ) = paperProtocol.deposits(1);
        assertEq(token, address(0));
        assertEq(amount, DEPOSIT_AMOUNT);
        assertEq(priceAtDeposit, INITIAL_PRICE);
        assertEq(priceTarget, PRICE_TARGET);
        vm.stopPrank();
    }

    function test_WithdrawToken() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(address(mockToken), DEPOSIT_AMOUNT, PRICE_TARGET);
        vm.stopPrank();

        // Set price above target to allow withdrawal
        // OracleAdapter converts 8 decimals to 18 decimals internally
        mockOracle.setPrice(int256(PRICE_TARGET / 1e10)); // Convert to 8 decimals

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

        // Set price above target to allow withdrawal
        // OracleAdapter converts 8 decimals to 18 decimals internally
        mockOracle.setPrice(int256(PRICE_TARGET / 1e10)); // Convert to 8 decimals

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

        // Set price below target
        // OracleAdapter converts 8 decimals to 18 decimals internally
        mockOracle.setPrice(int256((PRICE_TARGET * 9) / 10 / 1e10)); // 10% below target, converted to 8 decimals

        vm.startPrank(alice);
        paperProtocol.withdraw(1);
    }

    function testFail_WithdrawNotOwner() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(address(mockToken), DEPOSIT_AMOUNT, PRICE_TARGET);
        vm.stopPrank();

        // Set price above target
        // OracleAdapter converts 8 decimals to 18 decimals internally
        mockOracle.setPrice(int256(PRICE_TARGET / 1e10)); // Convert to 8 decimals

        vm.startPrank(bob);
        paperProtocol.withdraw(1);
    }

    function testFail_WithdrawTwice() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(address(mockToken), DEPOSIT_AMOUNT, PRICE_TARGET);
        vm.stopPrank();

        // Set price above target
        // OracleAdapter converts 8 decimals to 18 decimals internally
        mockOracle.setPrice(int256(PRICE_TARGET / 1e10)); // Convert to 8 decimals

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
}
