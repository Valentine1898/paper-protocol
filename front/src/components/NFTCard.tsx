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
    icon: "💪",
    description:
      "Calculated risk, calculated reward. You've done your homework and it shows.",
    svgPath: "/NFT/smart.svg",
    range: "$5,000 - $7,500",
  },
  strong: {
    name: " Strong Hands Tier",
    borderColor: "border-steel-400",
    backgroundColor: "bg-steel-50",
    textColor: "text-steel-800",
    accentColor: "text-steel-600",
    icon: "🦾",
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
  hideTitle?: boolean;
  hideNote?: boolean;
}

export default function NFTCard({
  amount,
  targetPrice,
  lockPrice = 2325.65,
  hideTitle = false,
  hideNote = false,
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
      {!hideTitle && (
        <div className="text-center">
          <h3 className=" text-3xl text-display text-primary-900 mb-4 mt-4 ">
            Your future NFT tier:
          </h3>
          <div
            className={`inline-flex items-center space-x-2 px-3 py-1  ${currentTier.backgroundColor} ${currentTier.borderColor} border`}
          >
            <span className="text-sm">{currentTier.icon}</span>
            <span
              className={`text-mono text-md font-bold ${currentTier.textColor}`}
            >
              {currentTier.range}
            </span>
          </div>
        </div>
      )}

      <div
        className={`bg-white relative p-3 transition-all duration-300 h-fit ${
          hideTitle ? "" : ""
        }`}
      >
        {/* NFT Visual */}
        <div
          className={`${currentTier.borderColor} border-4 absolute inset-2 `}
        ></div>
        <div className="bg-white text-center h-fit mt-2">
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
        <div className="space-y-1 p-4 mb-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-paper-600 text-mono font-bold">
              lock price:
            </span>
            <span className="text-mono font-bold">${lockPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-paper-600 text-mono font-bold">
              target price:
            </span>
            <span className="text-mono font-bold">
              {targetPrice ? `$${parseFloat(targetPrice).toFixed(0)}` : "--"}
              {targetPrice && (
                <span className={`ml-1 text-green-700`}>
                  ({priceIncrease > 0 ? "+" : ""}
                  {priceIncrease.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-paper-600 text-mono font-bold">amount:</span>
            <span className="text-mono font-bold">
              {amount ? `${parseFloat(amount).toFixed(1)} ETH` : "-- ETH"}
            </span>
          </div>
        </div>

        {/* Tier Badge */}
        <div className=" border-current border-opacity-20">
          <div
            className={`inline-flex items-center  px-3 py-1 w-full
                 ${currentTier.backgroundColor} `}
          >
            <span className="text-lg pr-2">{currentTier.icon}</span>
            <span
              className={`text-mono text-md font-bold ${currentTier.textColor}`}
            >
              {" "}
              {currentTier.name}
            </span>
          </div>
        </div>
      </div>
      {/* Additional Info */}
      {!hideNote && (
        <div className="text-center space-y-2 w-full flex items-center justify-center">
          <p className="text-body text-xs text-paper-600 w-[80%]">
            <strong>Note:</strong> You will receive an NFT representing your
            deposit. You can withdraw your funds when the target price is
            reached.
          </p>
        </div>
      )}
    </div>
  );
}
