"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { usePaperProtocol } from "@/hooks/usePaperProtocol";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import NFTCard from "./NFTCard";
import PresetButton from "./PresetButton";
import CurrencyInput from "./CurrencyInput";

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Supported tokens on Base Sepolia
const SUPPORTED_TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    icon: "Ξ",
  },
  {
    symbol: "MockToken",
    name: "Mock Token",
    address: "0xE130Ec9bB21e477E2822E940aDB1A43767A0F80a",
    decimals: 18,
    icon: "🪙",
  },
];

interface TokenBalance {
  symbol: string;
  balance: string;
  formattedBalance: string;
}

export default function DepositForm() {
  const { authenticated, user } = usePrivy();
  const paperProtocol = usePaperProtocol();
  const [isCorrectChain, setIsCorrectChain] = useState(true);

  const [selectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  const loadTokenBalances = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) return;

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    try {
      const balances: TokenBalance[] = [];

      for (const token of SUPPORTED_TOKENS) {
        let balance = "0";

        if (token.address === "0x0000000000000000000000000000000000000000") {
          const ethBalance = await publicClient.getBalance({
            address: user.wallet.address as `0x${string}`,
          });
          balance = ethBalance.toString();
        } else {
          try {
            const tokenBalance = await publicClient.readContract({
              address: token.address as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [user.wallet.address as `0x${string}`],
            });
            balance = tokenBalance.toString();
          } catch (error) {
            console.error(`Error loading ${token.symbol} balance:`, error);
          }
        }

        const formattedBalance = formatEther(BigInt(balance));
        balances.push({
          symbol: token.symbol,
          balance,
          formattedBalance: parseFloat(formattedBalance).toFixed(4),
        });
      }

      setTokenBalances(balances);
    } catch (error) {
      console.error("Error loading token balances:", error);
    }
  }, [authenticated, user?.wallet?.address]);

  const isOnCorrectChainFn = useMemo(
    () => paperProtocol.isOnCorrectChain,
    [paperProtocol.isOnCorrectChain]
  );

  const checkChain = useCallback(async () => {
    if (authenticated && user?.wallet?.address && isOnCorrectChainFn) {
      const correct = await isOnCorrectChainFn();
      setIsCorrectChain(correct);
    }
  }, [authenticated, user?.wallet?.address, isOnCorrectChainFn]);

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      loadTokenBalances();
      checkChain();
    }
  }, [authenticated, user?.wallet?.address, loadTokenBalances, checkChain]);

  const getCurrentTokenBalance = () => {
    const balance = tokenBalances.find(
      (b) => b.symbol === selectedToken.symbol
    );
    return balance ? parseFloat(balance.formattedBalance) : 0;
  };

  const getPricePresets = () => {
    return [
      {
        label: "💪 $5,000",
        value: "5000",
        color: "gold",
        tier: "Smart Hands",
        description:
          "Calculated risk, calculated reward. You've done your homework and it shows.",
      },
      {
        label: "🦾 $7,500",
        value: "7500",
        color: "steel",
        tier: "Strong Hands",
        description:
          "Steel resolve, steel hands. You're not just investing, you're making a statement.",
      },
      {
        label: "💎 $12,000",
        value: "12000",
        color: "diamond",
        tier: "Diamond Hands",
        description:
          "Legendary status. This is the stuff of trading folklore. Respect.",
      },
    ];
  };

  const getCurrentTier = () => {
    if (!targetPrice) return null;
    const priceNum = parseFloat(targetPrice);

    if (priceNum >= 10000)
      return {
        tier: "Diamond Hands",
        color: "diamond",
        description:
          "Legendary status. This is the stuff of trading folklore. Respect.",
      };
    if (priceNum >= 7500)
      return {
        tier: "Strong Hands",
        color: "steel",
        description:
          "Steel resolve, steel hands. You're not just investing, you're making a statement.",
      };
    if (priceNum >= 5000)
      return {
        tier: "Smart Hands",
        color: "gold",
        description:
          "Calculated risk, calculated reward. You've done your homework and it shows.",
      };
    return {
      tier: "Paper Hands",
      color: "paper",
      description:
        "Either you'll have a nice payday or a story about 'that one time'. Solid middle ground, friend.",
    };
  };

  const handleDeposit = async () => {
    if (!authenticated || !amount || !targetPrice) return;

    try {
      setLoading(true);

      let hash;
      if (
        selectedToken.address === "0x0000000000000000000000000000000000000000"
      ) {
        hash = await paperProtocol.depositEther(amount, targetPrice);
      } else {
        hash = await paperProtocol.depositToken(
          selectedToken.address,
          amount,
          targetPrice
        );
      }

      alert(`Deposit transaction sent! Hash: ${hash}`);
      setAmount("");
      setTargetPrice("");
      setTimeout(loadTokenBalances, 2000);
    } catch (error) {
      console.error("Deposit error:", error);
      alert("Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Tier badge variants
  const tierBadgeVariants = {
    paper: "bg-paper-50 text-paper-800 border-paper-300",
    gold: "bg-gold-50 text-gold-800 border-gold-300",
    steel: "bg-steel-50 text-steel-800 border-steel-300",
    diamond: "bg-diamond-50 text-diamond-800 border-diamond-300",
  };

  if (!authenticated) {
    return (
      <div className="bg-white rounded-2xl border border-paper-200 shadow-sm p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-paper-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-paper-600"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h3 className="text-display text-xl font-normal text-primary-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-body text-paper-600">
            Please connect your wallet to create positions
          </p>
        </div>
      </div>
    );
  }

  const currentTier = getCurrentTier();

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Form Section */}
      <div className="space-y-6">
        <div className="bg-[#F9F6F1] rounded-2xl border-2 border-paper-200 shadow-sm p-8">
          {/* Header */}
          <div className="mb-8">
            <h3 className="text-display text-2xl font-normal text-primary-900 mb-3">
              Set target ETH price
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
              <span className="text-body font-medium text-primary-700">
                1 ETH ≈ $2,765.65
              </span>
            </div>
          </div>

          {/* Price Target Input */}
          <div className="mb-8">
            <label className="block text-body text-sm font-semibold text-primary-800 mb-4">
              Choose your target price
            </label>

            {/* Custom Input */}
            <CurrencyInput
              value={targetPrice}
              onChange={setTargetPrice}
              placeholder="Or enter custom target price"
              currency="$"
              step="1"
              paddingLeft="pl-10"
            />
            {/* Preset Buttons */}
            <div className="flex gap-4 mb-6 mt-4">
              {getPricePresets().map((preset, index) => (
                <PresetButton
                  key={index}
                  label={preset.label}
                  value={preset.value}
                  color={preset.color}
                  tier={preset.tier}
                  isSelected={targetPrice === preset.value}
                  onClick={() => setTargetPrice(preset.value)}
                />
              ))}
            </div>

            {/* Tier Display */}
            {currentTier && (
              <div
                className="mt-4 p-4 border-2 transition-all duration-300"
                style={{
                  backgroundColor: `var(--color-${currentTier.color}-50)`,
                  borderColor: `var(--color-${currentTier.color}-300)`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`inline-flex items-center space-x-2 px-3 py-1 border ${
                      tierBadgeVariants[
                        currentTier.color as keyof typeof tierBadgeVariants
                      ]
                    }`}
                  >
                    <span className="text-sm font-bold">
                      {currentTier.tier}
                    </span>
                  </div>
                  <span className="text-xs text-paper-600">
                    {(
                      ((parseFloat(targetPrice) - 2765.65) / 2765.65) *
                      100
                    ).toFixed(1)}
                    % increase
                  </span>
                </div>
                <p
                  className="text-xs italic"
                  style={{ color: `var(--color-${currentTier.color}-800)` }}
                >
                  {currentTier.description}
                </p>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="mb-8">
            <label className="block text-body text-sm font-semibold text-primary-800 mb-4">
              Set ETH amount
            </label>
            <div className="text-sm text-paper-600 mb-3 flex items-center justify-between">
              <span>Available balance:</span>
              <span className="font-mono font-bold">
                {getCurrentTokenBalance().toFixed(4)} ETH
              </span>
            </div>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              currency="ETH"
              step="0.001"
              paddingLeft="pl-17"
            />
          </div>

          {/* Network Warning */}
          {!isCorrectChain && (
            <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="text-orange-600 text-xl">⚠️</div>
                <div>
                  <div className="text-sm font-semibold text-orange-800">
                    Wrong Network
                  </div>
                  <div className="text-xs text-orange-600">
                    Please switch to Base Sepolia to create deposits
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleDeposit}
            disabled={
              loading ||
              !amount ||
              !targetPrice ||
              !paperProtocol.isConnected ||
              !isCorrectChain
            }
            className="w-full bg-primary-800 hover:bg-primary-900 disabled:bg-paper-300 disabled:text-paper-500 text-white font-bold py-4 px-6 transition-all duration-200 text-body hover:shadow-lg disabled:hover:shadow-none"
          >
            {loading
              ? "Creating Deposit..."
              : !isCorrectChain
              ? "Switch to Base Sepolia"
              : "Create Position"}
          </button>
        </div>
      </div>

      {/* NFT Preview Section */}
      <div>
        <NFTCard
          amount={amount}
          targetPrice={targetPrice}
          lockPrice={2765.65}
        />
      </div>
    </div>
  );
}
