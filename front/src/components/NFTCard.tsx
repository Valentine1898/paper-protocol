"use client";

import Image from "next/image";

interface NFTTier {
  name: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  icon: string;
  description: string;
  svgPath: string;
  range: string;
}

const NFT_TIERS: Record<string, NFTTier> = {
  paper: {
    name: "Paper Hands Tier",
    borderColor: "border-paper-300",
    backgroundColor: "bg-paper-50",
    textColor: "text-paper-800",
    accentColor: "text-paper-600",
    icon: "🧻",
    description:
      "Either you'll have a nice payday or a story about 'that one time'. Solid middle ground, friend.",
    svgPath: "/NFT/paper.svg",
    range: "$0 - $5,000",
  },
  smart: {
    name: "Smart Hands Tier",
    borderColor: "border-gold-400",
    backgroundColor: "bg-gold-50",
    textColor: "text-gold-800",
    accentColor: "text-gold-600",
    icon: "💡",
    description:
      "Calculated risk, calculated reward. You've done your homework and it shows.",
    svgPath: "/NFT/smart.svg",
    range: "$5,000 - $7,500",
  },
  strong: {
    name: "Strong Hands Tier",
    borderColor: "border-steel-400",
    backgroundColor: "bg-steel-50",
    textColor: "text-steel-800",
    accentColor: "text-steel-600",
    icon: "💪",
    description:
      "Steel resolve, steel hands. You're not just investing, you're making a statement.",
    svgPath: "/NFT/strong.svg",
    range: "$7,500 - $10,000",
  },
  diamond: {
    name: "Diamond Hands Tier",
    borderColor: "border-diamond-400",
    backgroundColor: "bg-diamond-50",
    textColor: "text-diamond-800",
    accentColor: "text-diamond-600",
    icon: "💎",
    description:
      "Legendary status. This is the stuff of trading folklore. Respect.",
    svgPath: "/NFT/diamond.svg",
    range: "$10,000+",
  },
};

interface NFTCardProps {
  amount: string;
  targetPrice: string;
  lockPrice?: number;
}

export default function NFTCard({
  amount,
  targetPrice,
  lockPrice = 2325.65,
}: NFTCardProps) {
  const getTierFromPrice = (price: string): NFTTier => {
    if (!price) return NFT_TIERS.paper;

    const priceNum = parseFloat(price);

    if (priceNum >= 10000) return NFT_TIERS.diamond;
    if (priceNum >= 7500) return NFT_TIERS.strong;
    if (priceNum >= 5000) return NFT_TIERS.smart;
    return NFT_TIERS.paper;
  };

  const calculatePriceIncrease = (target: string, current: number): number => {
    if (!target) return 0;
    const targetNum = parseFloat(target);
    return ((targetNum - current) / current) * 100;
  };

  const currentTier = getTierFromPrice(targetPrice);
  const priceIncrease = calculatePriceIncrease(targetPrice, lockPrice);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-display text-xl font-normal text-primary-100 mb-2">
          Your future NFT
        </h3>
        <div
          className={`inline-flex items-center space-x-2 px-3 py-1  ${currentTier.backgroundColor} ${currentTier.borderColor} border`}
        >
          <span className="text-sm">{currentTier.icon}</span>
          <span
            className={`text-mono text-xs font-bold ${currentTier.textColor}`}
          >
            {currentTier.range}
          </span>
        </div>
      </div>

      <div
        className={`${currentTier.backgroundColor} ${currentTier.borderColor} border-2  p-6 transition-all duration-300`}
      >
        {/* NFT Visual */}
        <div className="bg-white  p-6 mb-4 text-center">
          <div className="relative inline-block">
            <div className="mx-auto flex justify-center">
              <Image
                src={currentTier.svgPath}
                alt={`${currentTier.name} NFT`}
                width={215}
                height={215}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* NFT Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-paper-600">lock price:</span>
            <span className="text-mono font-bold">${lockPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-paper-600">target price:</span>
            <span className="text-mono font-bold">
              {targetPrice ? `$${parseFloat(targetPrice).toFixed(0)}` : "--"}
              {targetPrice && (
                <span className={`ml-1 ${currentTier.accentColor}`}>
                  ({priceIncrease > 0 ? "+" : ""}
                  {priceIncrease.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-paper-600">amount:</span>
            <span className="text-mono font-bold">
              {amount ? `${parseFloat(amount).toFixed(1)} ETH` : "-- ETH"}
            </span>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <div
            className={`inline-flex items-center space-x-2 px-3 py-1 
                 ${currentTier.backgroundColor} ${currentTier.borderColor} border`}
          >
            <span className="text-lg">{currentTier.icon}</span>
            <span
              className={`text-mono text-xs font-bold ${currentTier.textColor}`}
            >
              {currentTier.name}
            </span>
          </div>
        </div>

        {/* Dynamic Message */}
        {amount && targetPrice && (
          <div className="mt-4 p-3 bg-white bg-opacity-50 border border-current border-opacity-20 ">
            <p
              className="text-body text-xs italic"
              style={{ color: currentTier.textColor.replace("text-", "") }}
            >
              {currentTier.description}
            </p>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-center space-y-2">
        <p className="text-body text-xs text-paper-600">
          <strong>Note:</strong> You will receive an NFT representing your
          deposit. You can withdraw your funds when the target price is reached.
        </p>
      </div>
    </div>
  );
}
