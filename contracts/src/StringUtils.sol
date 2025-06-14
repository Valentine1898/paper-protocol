// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

library StringUtils {
    function formatNumberWithDecimals(
        uint256 number,
        uint256 decimals,
        uint256 maxDecimals
    ) internal pure returns (string memory) {
        if (number == 0) return "0";

        // Convert to string with all decimals
        string memory fullNumber = Strings.toString(number);
        bytes memory fullNumberBytes = bytes(fullNumber);

        // If number is smaller than decimals, we need to add leading zeros
        if (fullNumberBytes.length <= decimals) {
            string memory leadingZeros = "";
            for (
                uint256 i = 0;
                i < decimals - fullNumberBytes.length + 1;
                i++
            ) {
                leadingZeros = string(abi.encodePacked(leadingZeros, "0"));
            }
            fullNumber = string(abi.encodePacked(leadingZeros, fullNumber));
            fullNumberBytes = bytes(fullNumber);
        }

        // Split into integer and decimal parts
        uint256 integerLength = fullNumberBytes.length - decimals;
        string memory integerPart = substring(fullNumber, 0, integerLength);
        string memory decimalPart = substring(
            fullNumber,
            integerLength,
            fullNumberBytes.length
        );

        // Remove trailing zeros from decimal part
        bytes memory decimalPartBytes = bytes(decimalPart);
        while (
            decimalPartBytes.length > 0 &&
            decimalPartBytes[decimalPartBytes.length - 1] == "0"
        ) {
            decimalPart = substring(
                decimalPart,
                0,
                decimalPartBytes.length - 1
            );
            decimalPartBytes = bytes(decimalPart);
        }

        // If decimal part is empty or all zeros, return just the integer part
        if (decimalPartBytes.length == 0) {
            return integerPart;
        }

        // Limit decimal places to maxDecimals
        if (decimalPartBytes.length > maxDecimals) {
            decimalPart = substring(decimalPart, 0, maxDecimals);
        }

        return string(abi.encodePacked(integerPart, ".", decimalPart));
    }

    /**
     * @notice Converts a price value to a string with decimal formatting
     * @param price The price value to convert (with 18 decimals)
     * @return string memory The formatted price string
     */
    function priceToString(
        uint256 price,
        uint256 oracleDecimals
    ) internal pure returns (string memory) {
        return formatNumberWithDecimals(price, oracleDecimals, 2);
    }

    /**
     * @notice Converts an amount value to a string with decimal formatting
     * @param amount The amount value to convert (with 18 decimals)
     * @return string memory The formatted amount string
     */
    function amountToString(
        uint256 amount,
        uint256 tokenDecimals
    ) internal pure returns (string memory) {
        return formatNumberWithDecimals(amount, tokenDecimals, 2);
    }

    function substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}
