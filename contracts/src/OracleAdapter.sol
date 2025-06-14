// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "./interfaces/chainlink/AggregatorV3Interface.sol";

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

    /**
     * @notice Gets the current price of a token
     * @param token The address of the token to get the price for
     * @return price The current price of the token with 18 decimals
     * @dev Returns 0 for unsupported tokens
     */
    function getPrice(address token) external view returns (uint256 price) {
        OracleConfig memory config = oracleConfigs[token];
        if (config.oracleAddress == address(0)) revert OracleNotSet(token);

        AggregatorV3Interface oracle = AggregatorV3Interface(
            config.oracleAddress
        );

        (, int256 answer, , uint256 updatedAt, ) = oracle.latestRoundData();

        // Check if price is stale
        if (block.timestamp - updatedAt > config.heartbeat) revert StalePrice();

        // Check for negative or zero price
        if (answer <= 0) revert InvalidPrice();

        // Convert to 18 decimals
        return uint256(answer) * (10 ** (18 - config.decimals));
    }

    /**
     * @notice Gets the number of decimals used for price values
     * @return uint8 The number of decimals (18)
     */
    function getDecimals() external pure returns (uint8) {
        return 18;
    }

    function getOracle(
        address token
    )
        external
        view
        returns (
            OracleType oracleType,
            address oracleAddress,
            uint8 decimals,
            uint256 heartbeat
        )
    {
        OracleConfig memory config = oracleConfigs[token];
        if (config.oracleAddress == address(0)) revert OracleNotSet(token);

        return (
            config.oracleType,
            config.oracleAddress,
            config.decimals,
            config.heartbeat
        );
    }
}
