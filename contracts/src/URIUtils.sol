// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {IPaperProtocol} from "./interfaces/IPaperProtocol.sol";

import {PaperTiers} from "./PaperTiers.sol";
import {PaperWrapper} from "./PaperWrapper.sol";

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
        uint256 oracleDecimals
    ) internal view returns (string memory) {
        PaperTiers.PaperTierData memory paperTierData = PaperTiers
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

        bytes memory fullSvg = PaperWrapper.getPaperProtocolTokenSVG(
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

    /*
{
   "name": "Paper Protocol NFT ${id}",
   "description": "A deposit in Paper Protocol",
   "image": "https://",
   "attributes": [
      {
         "trait_type": "Token",
         "value": "ETH"
      },
      {
         "trait_type": "Amount",
         "value": "1.5"
      },
      {
         "trait_type": "Price Target",
         "value": "2000"
      },
      {
         "trait_type": "Tier",
         "value": "Paper Hands" | "Smart Hands" |  "Strong Hands" | "Diamond Hands"
      }
   ]
}
*/
    function tokenURI(
        IPaperProtocol.Deposit memory deposit,
        uint256 oracleDecimals
    ) internal view returns (string memory) {
        string memory svgImageURI = svgToImageURI(
            generateTokenSVG(deposit, oracleDecimals)
        );

        return
            generateBase64EncodedJSON(
                abi.encodePacked(
                    '{"name":"Paper Protocol",',
                    '"image":"',
                    svgImageURI,
                    '"}'
                )
            );
    }

    /*
   {
      "name": "Paper Protocol",
      "description": "A protocol for token deposits with price targets",
      "image": "https://", // SVG
      "external_link": "https://",
   }
   */
    function contractURI() internal view returns (string memory) {
        return
            generateBase64EncodedJSON(
                abi.encodePacked('{"name":"Paper Protocol"}')
            );
    }
}
