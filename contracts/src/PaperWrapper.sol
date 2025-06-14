// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Base64} from "lib/openzeppelin-contracts/contracts/utils/Base64.sol";
import {Strings} from "lib/openzeppelin-contracts/contracts/utils/Strings.sol";

import {IPaperProtocol} from "./interfaces/IPaperProtocol.sol";

import {StringUtils} from "./StringUtils.sol";

library PaperWrapper {
    struct PaperProtocolTokenSVGArgs {
        uint256 lockPrice;
        uint256 targetPrice;
        uint256 depositAmount;
        uint256 oracleDecimals;
        uint8 tokenDecimals;
        string tokenSymbol;
        string borderColor; // border color + color for tier text background (partially transparent in svg itself)
        string tierText;
        string tierTextColor;
        string paperSVG;
    }

    function getSVGHeader(
        string memory borderColor
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                '<svg width="304" height="379" fill="none" xmlns="http://www.w3.org/2000/svg">',
                '<path fill="#fff" d="M0 0h304v379H0z"/>',
                '<path fill="#fff" stroke="#',
                borderColor,
                '" stroke-width="3.341" d="M7.67 7.67h288.659v363.659H7.67z"/>',
                '<path fill="#',
                borderColor,
                '" fill-opacity=".2" d="M9 330h286v40H9z"/>'
            );
    }

    /**
     * @notice Calculates the percentage increase between two prices
     * @param lockPrice The original price
     * @param targetPrice The target price
     * @return int256 The percentage increase (can be negative for price decreases)
     */
    function calculatePriceIncreasePercentage(
        uint256 lockPrice,
        uint256 targetPrice
    ) internal pure returns (int256) {
        if (targetPrice >= lockPrice) {
            return int256(((targetPrice - lockPrice) * 100) / lockPrice);
        } else {
            return -int256(((lockPrice - targetPrice) * 100) / lockPrice);
        }
    }

    /**
     * @notice Gets the price text for display in the SVG
     * @param lockPrice The price at which the token was locked
     * @param targetPrice The target price for the token
     * @param oracleDecimals The number of decimals used by the oracle
     * @return string memory The formatted price text
     */
    function getPriceText(
        uint256 lockPrice,
        uint256 targetPrice,
        uint256 oracleDecimals
    ) internal pure returns (bytes memory) {
        string memory percentageStr = "";
        if (targetPrice > lockPrice) {
            int256 percentage = calculatePriceIncreasePercentage(
                lockPrice,
                targetPrice
            );
            percentageStr = string(
                abi.encodePacked(
                    " (",
                    Strings.toString(uint256(percentage)),
                    "%)"
                )
            );
        }

        return
            abi.encodePacked(
                '<text font-family="Courier New, monospace" font-size="14" font-weight="700" transform="translate(24 248)">',
                '<tspan fill="#A7A7A7">lock price: </tspan> <tspan fill="#302207" x="260" text-anchor="end">$',
                StringUtils.priceToString(lockPrice, oracleDecimals),
                "</tspan></text>",
                '<text font-family="Courier New, monospace" font-size="14" font-weight="700" transform="translate(24 272)">',
                '<tspan fill="#A7A7A7">target price: </tspan> <tspan fill="#302207" x="260" text-anchor="end">$',
                StringUtils.priceToString(targetPrice, oracleDecimals),
                '</tspan> <tspan fill="#24C35C">',
                percentageStr,
                "</tspan></text>"
            );
    }

    function getAmountAndTierText(
        string memory amountStr,
        string memory tokenSymbol,
        string memory tierText,
        string memory tierTextColor
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                '<text font-family="Courier New, monospace" font-size="14" font-weight="700" transform="translate(24 296)">',
                '<tspan fill="#A7A7A7">amount: </tspan> <tspan fill="#302207" x="260" text-anchor="end">',
                amountStr,
                " ",
                tokenSymbol,
                "</tspan></text>",
                '<text x="21" y="358" font-family="Courier New, monospace" font-weight="700" font-size="16.7" fill="#',
                tierTextColor,
                '">',
                tierText,
                "</text>"
            );
    }

    function getPaperProtocolTokenSVG(
        PaperProtocolTokenSVGArgs memory args
    ) internal pure returns (bytes memory) {
        string memory amountStr = StringUtils.amountToString(
            args.depositAmount,
            args.tokenDecimals
        );

        bytes memory header = getSVGHeader(args.borderColor);
        bytes memory priceText = getPriceText(
            args.lockPrice,
            args.targetPrice,
            args.oracleDecimals
        );
        bytes memory amountAndTierText = getAmountAndTierText(
            amountStr,
            args.tokenSymbol,
            args.tierText,
            args.tierTextColor
        );

        return
            abi.encodePacked(
                header,
                priceText,
                amountAndTierText,
                args.paperSVG,
                "</svg>"
            );
    }
}
