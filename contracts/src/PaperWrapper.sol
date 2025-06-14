// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {IPaperProtocol} from "./interfaces/IPaperProtocol.sol";

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

    // TODO: make this function to work with decimals, because precesion is currently shown with 18 decimals
    function priceToString(
        uint256 price,
        uint256 oracleDecimals
    ) internal pure returns (string memory) {
        return Strings.toString(price / 10 ** oracleDecimals);
    }

    // TODO: same as with priceToString
    function amountToString(
        uint256 amount,
        uint256 tokenDecimals
    ) internal pure returns (string memory) {
        return Strings.toString(amount / 10 ** tokenDecimals);
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

    function getPriceText(
        string memory lockPriceStr,
        string memory targetPriceStr
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                '<text font-family="Courier New, monospace" font-size="14" font-weight="700" transform="translate(24 248)">',
                '<tspan fill="#A7A7A7">lock price: </tspan> <tspan fill="#302207">$',
                lockPriceStr,
                "</tspan></text>",
                '<text font-family="Courier New, monospace" font-size="14" font-weight="700" transform="translate(24 272)">',
                '<tspan fill="#A7A7A7">target price: </tspan> <tspan fill="#302207">',
                targetPriceStr,
                '</tspan> <tspan fill="#24C35C">(80,79%)</tspan></text>'
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
                '<tspan fill="#A7A7A7">amount: </tspan> <tspan fill="#302207">',
                amountStr,
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
        // Pre-compute string values
        string memory lockPriceStr = priceToString(
            args.lockPrice,
            args.oracleDecimals
        );
        string memory targetPriceStr = priceToString(
            args.targetPrice,
            args.oracleDecimals
        );
        string memory amountStr = amountToString(
            args.depositAmount,
            args.tokenDecimals
        );

        // Generate SVG parts
        bytes memory header = getSVGHeader(args.borderColor);
        bytes memory priceText = getPriceText(lockPriceStr, targetPriceStr);
        bytes memory amountAndTierText = getAmountAndTierText(
            amountStr,
            args.tokenSymbol,
            args.tierText,
            args.tierTextColor
        );

        // Combine all parts
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
