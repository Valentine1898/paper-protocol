// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {IPaperProtocol} from "./interfaces/IPaperProtocol.sol";
import {PaperTiers} from "./PaperTiers.sol";
import {PaperWrapper} from "./PaperWrapper.sol";
import {StringUtils} from "./StringUtils.sol";

library URIUtils {
    function generateBase64EncodedJSON(
        bytes memory json
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(json)
                )
            );
    }

    function svgToImageURI(
        string memory svg
    ) internal pure returns (string memory) {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }

    function generateTokenSVG(
        IPaperProtocol.Deposit memory deposit,
        uint256 oracleDecimals,
        PaperTiers paperTiers,
        PaperWrapper paperWrapper
    ) internal view returns (string memory) {
        PaperTiers.PaperTierData memory paperTierData = paperTiers
            .getPaperTierData(deposit.priceTarget, oracleDecimals);

        PaperWrapper.PaperProtocolTokenSVGArgs
            memory paperWrapperArgs = PaperWrapper.PaperProtocolTokenSVGArgs({
                lockPrice: deposit.priceAtDeposit,
                targetPrice: deposit.priceTarget,
                depositAmount: deposit.amount,
                oracleDecimals: oracleDecimals,
                tokenDecimals: getTokenDecimals(deposit.token),
                tokenSymbol: getTokenSymbol(deposit.token),
                borderColor: paperTierData.borderColor,
                tierText: paperTierData.tierText,
                tierTextColor: paperTierData.tierTextColor,
                paperSVG: paperTierData.paperSVG
            });

        bytes memory fullSvg = paperWrapper.getPaperProtocolTokenSVG(
            paperWrapperArgs
        );

        return string(fullSvg);
    }

    function getTokenSymbol(
        address token
    ) internal view returns (string memory) {
        if (token == address(0)) {
            return "ETH";
        }
        return IERC20Metadata(token).symbol();
    }

    function getTokenDecimals(address token) internal view returns (uint8) {
        if (token == address(0)) {
            return 18;
        }
        return IERC20Metadata(token).decimals();
    }

    function generateAttributeItem(
        string memory name,
        string memory value
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '{"trait_type":"',
                    name,
                    '","value":"',
                    value,
                    '"}'
                )
            );
    }

    function generateAttributes(
        IPaperProtocol.Deposit memory deposit,
        uint256 oracleDecimals,
        string memory tierText
    ) internal view returns (bytes memory) {
        return
            abi.encodePacked(
                generateAttributeItem("Token", getTokenSymbol(deposit.token)),
                ",",
                generateAttributeItem(
                    "Amount",
                    StringUtils.amountToString(
                        deposit.amount,
                        getTokenDecimals(deposit.token)
                    )
                ),
                ",",
                generateAttributeItem(
                    "Lock Price",
                    StringUtils.priceToString(
                        deposit.priceAtDeposit,
                        oracleDecimals
                    )
                ),
                ",",
                generateAttributeItem(
                    "Price Target",
                    StringUtils.priceToString(
                        deposit.priceTarget,
                        oracleDecimals
                    )
                ),
                ",",
                generateAttributeItem("Tier", tierText)
            );
    }

    function generateTokenMetadata(
        uint256 tokenId,
        string memory svgImageURI,
        bytes memory attributes
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                '{"name":"Paper Protocol NFT #',
                Strings.toString(tokenId),
                '",',
                '"image":"',
                svgImageURI,
                '",',
                '"attributes":[',
                attributes,
                "]}"
            );
    }

    /**
     * @notice Generates the token URI for a specific NFT token
     * @param tokenId The ID of the token
     * @return A JSON string containing the token metadata with the following structure:
     * {
     *   "name": "Paper Protocol NFT ${id}",
     *   "description": "A deposit in Paper Protocol",
     *   "image": "data:image/svg+xml;base64,${base64_encoded_svg}",
     *   "attributes": [
     *     {
     *       "trait_type": "Token",
     *       "value": "${token_symbol}"
     *     },
     *     {
     *       "trait_type": "Amount",
     *       "value": "${formatted_amount}"
     *     },
     *     {
     *       "trait_type": "Lock Price",
     *       "value": "${formatted_lock_price}"
     *     },
     *     {
     *       "trait_type": "Price Target",
     *       "value": "${formatted_target_price}"
     *     },
     *     {
     *       "trait_type": "Tier",
     *       "value": "${tier_name}"
     *     }
     *   ]
     * }
     */
    function tokenURI(
        uint256 tokenId,
        IPaperProtocol.Deposit memory deposit,
        uint256 oracleDecimals,
        PaperTiers paperTiers,
        PaperWrapper paperWrapper
    ) internal view returns (string memory) {
        PaperTiers.PaperTierData memory paperTierData = paperTiers
            .getPaperTierData(deposit.priceTarget, oracleDecimals);

        PaperWrapper.PaperProtocolTokenSVGArgs
            memory paperWrapperArgs = PaperWrapper.PaperProtocolTokenSVGArgs({
                lockPrice: deposit.priceAtDeposit,
                targetPrice: deposit.priceTarget,
                depositAmount: deposit.amount,
                oracleDecimals: oracleDecimals,
                tokenDecimals: getTokenDecimals(deposit.token),
                tokenSymbol: getTokenSymbol(deposit.token),
                borderColor: paperTierData.borderColor,
                tierText: paperTierData.tierText,
                tierTextColor: paperTierData.tierTextColor,
                paperSVG: paperTierData.paperSVG
            });

        bytes memory fullSvg = paperWrapper.getPaperProtocolTokenSVG(
            paperWrapperArgs
        );

        string memory svgImageURI = svgToImageURI(string(fullSvg));
        bytes memory attributes = generateAttributes(
            deposit,
            oracleDecimals,
            paperTierData.tierText
        );
        bytes memory metadata = generateTokenMetadata(
            tokenId,
            svgImageURI,
            attributes
        );

        return generateBase64EncodedJSON(metadata);
    }

    /**
     * @notice Generates the contract URI containing the collection metadata
     * @return A JSON string containing the contract metadata with the following structure:
     * {
     *   "name": "Paper Protocol",
     *   "description": "A protocol for token deposits with price targets",
     *   "image": "data:image/svg+xml;base64,${base64_encoded_svg}",
     * }
     */
    function contractURI() internal pure returns (string memory) {
        return
            generateBase64EncodedJSON(
                abi.encodePacked(
                    '{"name":"Paper Protocol", ',
                    '"description": "The first protocol that guarantees you will achieve your desired price",',
                    '"external_link": "https://paper-protocol.vercel.app/",',
                    '"image": "https://teal-key-swift-188.mypinata.cloud/ipfs/bafkreifjresjizmbxqrjlffoikm5itlqp52l5mjxtkxnq4zi2m7vznaoii"',
                    "}"
                )
            );
    }
}
