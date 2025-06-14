// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ITier} from "./interfaces/ITier.sol";

import {PaperHandsTier} from "./tiers/PaperHandsTier.sol";
import {SmartHandsTier} from "./tiers/SmartHandsTier.sol";
import {StrongHandsTier} from "./tiers/StrongHandsTier.sol";
import {DiamondHandsTier} from "./tiers/DiamondHandsTier.sol";

contract PaperTiers {
    mapping(uint256 tierIndex => address) public tierSvgContracts;

    struct PaperTierData {
        string paperSVG;
        string tierText;
        string tierTextColor;
        string borderColor;
        string tierName;
    }

    constructor() {
        tierSvgContracts[1] = address(new PaperHandsTier());
        tierSvgContracts[2] = address(new SmartHandsTier());
        tierSvgContracts[3] = address(new StrongHandsTier());
        tierSvgContracts[4] = address(new DiamondHandsTier());
    }

    function getPaperTierData(
        uint256 priceTarget,
        uint256 oracleDecimals
    ) external view returns (PaperTierData memory) {
        uint256 oracleDecimalsMultiplier = 10 ** oracleDecimals;
        if (priceTarget < 5000 * oracleDecimalsMultiplier) {
            return
                PaperTierData({
                    paperSVG: ITier(tierSvgContracts[1]).svg(),
                    tierText: unicode"🧻 Paper Hands Tier",
                    tierTextColor: "302207",
                    borderColor: "D5CAB4",
                    tierName: "Paper Hands"
                });
        }
        if (priceTarget < 7500 * oracleDecimalsMultiplier) {
            return
                PaperTierData({
                    paperSVG: ITier(tierSvgContracts[2]).svg(),
                    tierText: unicode"💪 Smart Hands Tier",
                    tierTextColor: "EA9400",
                    borderColor: "FFBE3D",
                    tierName: "Smart Hands"
                });
        }

        if (priceTarget < 10000 * oracleDecimalsMultiplier) {
            return
                PaperTierData({
                    paperSVG: ITier(tierSvgContracts[3]).svg(),
                    tierText: unicode"🦾 Strong Hands Tier",
                    tierTextColor: "8991B1",
                    borderColor: "8991B1",
                    tierName: "Strong Hands"
                });
        }

        return
            PaperTierData({
                paperSVG: ITier(tierSvgContracts[4]).svg(),
                tierText: unicode"💪 Diamond Hands Tier",
                tierTextColor: "0487F8",
                borderColor: "3DA5FF",
                tierName: "Diamond Hands"
            });
    }
}
