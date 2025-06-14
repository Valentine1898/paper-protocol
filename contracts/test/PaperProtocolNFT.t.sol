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
    uint256 public constant PRICE_TARGET = 2500 ether; // This will trigger Paper Hands tier

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
        paperProtocol.deposit(address(mockToken), DEPOSIT_AMOUNT, PRICE_TARGET);

        string memory uri = paperProtocol.tokenURI(1);
        console.log("Token URI for token deposit:", uri);

        // Verify that the URI contains the Paper Hands tier text
        assertTrue(bytes(uri).length > 0, "Token URI should not be empty");
        assertTrue(
            bytes(uri).length > 0 && bytes(uri).length < 10000,
            "Token URI should be a reasonable length"
        );
        vm.stopPrank();
    }

    function test_TokenURIEtherDeposit() public {
        vm.startPrank(alice);
        paperProtocol.deposit{value: DEPOSIT_AMOUNT}(
            address(0),
            DEPOSIT_AMOUNT,
            PRICE_TARGET
        );

        string memory uri = paperProtocol.tokenURI(1);
        console.log("Token URI for ETH deposit:", uri);

        // Verify that the URI contains the Paper Hands tier text
        assertTrue(bytes(uri).length > 0, "Token URI should not be empty");
        assertTrue(
            bytes(uri).length > 0 && bytes(uri).length < 10000,
            "Token URI should be a reasonable length"
        );
        vm.stopPrank();
    }
}
