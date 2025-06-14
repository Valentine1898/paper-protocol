// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {PaperProtocol} from "../src/PaperProtocol.sol";
import {OracleAdapter} from "../src/OracleAdapter.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {Setup} from "./Setup.sol";

contract PaperProtocolNFTTest is Setup {
    MockERC20 public mockToken;
    address public alice = makeAddr("alice");
    address public owner = makeAddr("owner");

    uint256 public constant INITIAL_BALANCE = 1000 ether;
    uint256 public constant DEPOSIT_AMOUNT = 100 ether;

    // Price targets for different tiers
    uint256 public constant PAPER_HANDS_TARGET = 2500 ether; // < 5000
    uint256 public constant SMART_HANDS_TARGET = 6000 ether; // < 7500
    uint256 public constant STRONG_HANDS_TARGET = 8500 ether; // < 10000
    uint256 public constant DIAMOND_HANDS_TARGET = 12000 ether; // >= 10000

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

        vm.stopPrank();

        mockToken.mint(alice, INITIAL_BALANCE);
        vm.deal(alice, INITIAL_BALANCE);
    }

    function test_TokenURIPaperHandsTier() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(
            address(mockToken),
            DEPOSIT_AMOUNT,
            PAPER_HANDS_TARGET
        );

        string memory uri = paperProtocol.tokenURI(1);
        console.log("Token URI for Paper Hands tier:", uri);
        assertTrue(bytes(uri).length > 0, "Token URI should not be empty");
        vm.stopPrank();
    }

    function test_TokenURISmartHandsTier() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(
            address(mockToken),
            DEPOSIT_AMOUNT,
            SMART_HANDS_TARGET
        );

        string memory uri = paperProtocol.tokenURI(1);
        console.log("Token URI for Smart Hands tier:", uri);
        assertTrue(bytes(uri).length > 0, "Token URI should not be empty");
        vm.stopPrank();
    }

    function test_TokenURIStrongHandsTier() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(
            address(mockToken),
            DEPOSIT_AMOUNT,
            STRONG_HANDS_TARGET
        );

        string memory uri = paperProtocol.tokenURI(1);
        console.log("Token URI for Strong Hands tier:", uri);
        assertTrue(bytes(uri).length > 0, "Token URI should not be empty");
        vm.stopPrank();
    }

    function test_TokenURIDiamondHandsTier() public {
        vm.startPrank(alice);
        mockToken.approve(address(paperProtocol), DEPOSIT_AMOUNT);
        paperProtocol.deposit(
            address(mockToken),
            DEPOSIT_AMOUNT,
            DIAMOND_HANDS_TARGET
        );

        string memory uri = paperProtocol.tokenURI(1);
        console.log("Token URI for Diamond Hands tier:", uri);
        assertTrue(bytes(uri).length > 0, "Token URI should not be empty");
        vm.stopPrank();
    }

    function test_TokenURIEtherDeposit() public {
        vm.startPrank(alice);
        paperProtocol.deposit{value: DEPOSIT_AMOUNT}(
            address(0),
            DEPOSIT_AMOUNT,
            PAPER_HANDS_TARGET
        );

        string memory uri = paperProtocol.tokenURI(1);
        console.log("Token URI for ETH deposit:", uri);
        assertTrue(bytes(uri).length > 0, "Token URI should not be empty");
        vm.stopPrank();
    }

    function test_TokenURIWithDifferentAmounts() public {
        vm.startPrank(alice);

        // Test with small amount
        uint256 smallAmount = 1 ether;
        mockToken.approve(address(paperProtocol), smallAmount);
        paperProtocol.deposit(
            address(mockToken),
            smallAmount,
            PAPER_HANDS_TARGET
        );
        string memory uriSmall = paperProtocol.tokenURI(1);
        console.log("Token URI for small amount:", uriSmall);
        assertTrue(bytes(uriSmall).length > 0, "Token URI should not be empty");

        // Test with large amount
        uint256 largeAmount = 500 ether;
        mockToken.approve(address(paperProtocol), largeAmount);
        paperProtocol.deposit(
            address(mockToken),
            largeAmount,
            DIAMOND_HANDS_TARGET
        );
        string memory uriLarge = paperProtocol.tokenURI(1);
        console.log("Token URI for large amount:", uriLarge);
        assertTrue(bytes(uriLarge).length > 0, "Token URI should not be empty");

        vm.stopPrank();
    }

    function test_TokenURIWithNonPerfectDecimals() public {
        vm.startPrank(alice);
        uint256 tokenId = 1;

        // Test with small decimal amount (0.5 tokens)
        uint256 smallDecimalAmount = 0.5 ether;
        mockToken.approve(address(paperProtocol), smallDecimalAmount);
        paperProtocol.deposit(
            address(mockToken),
            smallDecimalAmount,
            PAPER_HANDS_TARGET
        );
        string memory uriSmallDecimal = paperProtocol.tokenURI(tokenId);
        console.log(
            "Token URI for small decimal amount (0.5):",
            uriSmallDecimal
        );
        assertTrue(
            bytes(uriSmallDecimal).length > 0,
            "Token URI should not be empty"
        );
        tokenId++;

        // Test with medium decimal amount (123.45 tokens)
        uint256 mediumDecimalAmount = 123.45 ether;
        mockToken.approve(address(paperProtocol), mediumDecimalAmount);
        paperProtocol.deposit(
            address(mockToken),
            mediumDecimalAmount,
            SMART_HANDS_TARGET
        );
        string memory uriMediumDecimal = paperProtocol.tokenURI(tokenId);
        console.log(
            "Token URI for medium decimal amount (123.45):",
            uriMediumDecimal
        );
        assertTrue(
            bytes(uriMediumDecimal).length > 0,
            "Token URI should not be empty"
        );
        tokenId++;

        // Test with large decimal amount (500 tokens)
        uint256 largeDecimalAmount = 500 ether;
        mockToken.approve(address(paperProtocol), largeDecimalAmount);
        paperProtocol.deposit(
            address(mockToken),
            largeDecimalAmount,
            DIAMOND_HANDS_TARGET
        );
        string memory uriLargeDecimal = paperProtocol.tokenURI(tokenId);
        console.log(
            "Token URI for large decimal amount (500):",
            uriLargeDecimal
        );
        assertTrue(
            bytes(uriLargeDecimal).length > 0,
            "Token URI should not be empty"
        );
        tokenId++;

        // Test with very small decimal amount (0.01 tokens)
        uint256 verySmallDecimalAmount = 0.01 ether;
        mockToken.approve(address(paperProtocol), verySmallDecimalAmount);
        paperProtocol.deposit(
            address(mockToken),
            verySmallDecimalAmount,
            PAPER_HANDS_TARGET
        );
        string memory uriVerySmallDecimal = paperProtocol.tokenURI(tokenId);
        console.log(
            "Token URI for very small decimal amount (0.01):",
            uriVerySmallDecimal
        );
        assertTrue(
            bytes(uriVerySmallDecimal).length > 0,
            "Token URI should not be empty"
        );

        vm.stopPrank();
    }

    function test_ContractURI() public {
        string memory uri = paperProtocol.contractURI();
        console.log("Contract URI:", uri);
        assertTrue(bytes(uri).length > 0, "Contract URI should not be empty");
    }
}
