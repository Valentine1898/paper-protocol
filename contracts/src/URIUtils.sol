// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

library URIUtils {
    function _generateBase64EncodedJSON(
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

    function _generateTokenSVG(
        uint256 tokenId_
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg data-name="Paper Protocol" xmlns="http://www.w3.org/2000/svg">NFT</svg>'
                )
            );
    }

    /*
{
   "name": "Paper Protocol Deposit #1",
   "description": "A deposit in Paper Protocol",
   "image": "https://your-domain.com/images/1.png",
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
         "trait_type": "Deposit Date",
         "value": "2024-03-20"
      }
   ]
}
*/
    function _tokenURI(uint256 tokenId_) internal pure returns (string memory) {
        string memory svgImageURI = svgToImageURI(_generateTokenSVG(tokenId_));

        return
            _generateBase64EncodedJSON(
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
    function _contractURI() internal pure returns (string memory) {
        return
            _generateBase64EncodedJSON(
                abi.encodePacked('{"name":"Paper Protocol"}')
            );
    }
}
