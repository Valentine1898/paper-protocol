// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "./interfaces/chainlink/AggregatorV3Interface.sol";
import {IRedstoneAdapter} from "./interfaces/redstone/IRedstoneAdapter.sol";

contract OracleAdapter is Ownable {
    error OracleNotSet(address token);
    error InvalidOracleType();
    error InvalidDecimals();
    error StalePrice();
    error InvalidPrice();

    enum OracleType {
        Chainlink,
        Redstone
    }

    struct OracleConfig {
        OracleType oracleType;
        address oracleAddress;
        uint8 decimals;
        uint256 heartbeat; // in seconds
    }

    mapping(address token => OracleConfig config) public oracleConfigs;

    event OracleSet(
        address indexed token,
        OracleType oracleType,
        address oracleAddress,
        uint8 decimals,
        uint256 heartbeat
    );
    event OracleRemoved(address indexed token);

    constructor() Ownable(msg.sender) {}

    function setOracle(
        address token,
        OracleConfig memory config
    ) external onlyOwner {
        if (config.decimals > 18) revert InvalidDecimals();
        if (config.heartbeat == 0) revert InvalidDecimals();

        oracleConfigs[token] = OracleConfig({
            oracleType: config.oracleType,
            oracleAddress: config.oracleAddress,
            decimals: config.decimals,
            heartbeat: config.heartbeat
        });

        emit OracleSet(
            token,
            config.oracleType,
            config.oracleAddress,
            config.decimals,
            config.heartbeat
        );
    }

    function removeOracle(address token) external onlyOwner {
        delete oracleConfigs[token];
        emit OracleRemoved(token);
    }

    function getPrice(address token) external view returns (uint256 price) {
        OracleConfig memory config = oracleConfigs[token];
        if (config.oracleAddress == address(0)) revert OracleNotSet(token);

        if (config.oracleType == OracleType.Chainlink) {
            price = _getChainlinkPrice(config);
        } else if (config.oracleType == OracleType.Redstone) {
            price = _getRedstonePrice(config);
        } else {
            revert InvalidOracleType();
        }
    }

    function _getChainlinkPrice(
        OracleConfig memory config
    ) internal view returns (uint256) {
        AggregatorV3Interface oracle = AggregatorV3Interface(
            config.oracleAddress
        );

        (, int256 price, , uint256 updatedAt, ) = oracle.latestRoundData();

        // Check if price is stale
        if (block.timestamp - updatedAt > config.heartbeat) revert StalePrice();

        // Convert to 18 decimals
        return uint256(price) * (10 ** (18 - config.decimals));
    }

    function _getRedstonePrice(
        OracleConfig memory config
    ) internal view returns (uint256) {
        IRedstoneAdapter oracle = IRedstoneAdapter(config.oracleAddress);

        bytes32 dataFeedId = bytes32(uint256(uint160(config.oracleAddress)));

        // Get price from Redstone (returns in 8 decimals)
        uint256 price = oracle.getValueForDataFeed(dataFeedId);

        // Check if price is stale
        (, uint128 blockTimestamp) = oracle.getTimestampsFromLatestUpdate();
        if (block.timestamp - blockTimestamp > config.heartbeat)
            revert StalePrice();

        // Convert to 18 decimals
        return price * (10 ** (18 - config.decimals));
    }
}
