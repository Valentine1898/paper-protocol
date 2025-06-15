"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { usePaperProtocol } from "@/hooks/usePaperProtocol";
import { useETHPrice } from "@/hooks/useETHPrice";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import NFTCard from "./NFTCard";
import PresetButton from "./PresetButton";
import CurrencyInput from "./CurrencyInput";
import toast from "react-hot-toast";

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
  const {
    price: ethPrice,
  } = useETHPrice();
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
          "Either you'll have a nice payday or a story about 'that one time.' Solid middle ground, friend.",
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
        label: "💎 $10,000",
        value: "10000",
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

    // Only show tiers for values within our defined ranges
    if (priceNum >= 10000)
      return {
        tier: "Diamond Hands",
        color: "diamond",
        description:
          "You're either going to be legendary or become a cautionary tale. Respect.",
      };
    if (priceNum >= 7500)
      return {
        tier: "Strong Hands",
        color: "steel",
        description:
          "Either you're about to look like a genius or... well, at least you believed in something big.",
      };
    if (priceNum >= 5000)
      return {
        tier: "Smart Hands",
        color: "gold",
        description:
          "Either you'll have a nice payday or a story about 'that one time.' Solid middle ground, friend.",
      };

    // Return null for values below $5,000 - no tier display
    return null;
  };

  const handleDeposit = async () => {
    if (!amount || !targetPrice) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!paperProtocol.isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    const isCorrectChain = await paperProtocol.isOnCorrectChain();
    if (!isCorrectChain) {
      try {
        await paperProtocol.switchToBaseSepolia();
      } catch {
        toast.error("Please switch to Base Sepolia network");
        return;
      }
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Creating deposit...");
      
      await paperProtocol.depositEther(amount, targetPrice);
      
      toast.dismiss(loadingToast);
      toast.success("Deposit created successfully!");

      // Reset form
      setAmount("");
      setTargetPrice("");
      setTimeout(loadTokenBalances, 2000);
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="bg-white  border border-paper-200 shadow-sm p-8">
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
    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Form Section */}
      <div className="space-y-6 lg:col-span-2">
        <div className="bg-white    p-9 pt-8 ">
          {/* Price Target Input */}
          <div className="mb-19">
            <div className="flex items-center justify-between ">
              <label className="block text-lg font-mono font-bold text-primary-800">
                Set target price for 1 ETH
              </label>
              <div className="text-md text-primary-900/60">
                Max Price: $22,222
              </div>
            </div>

            {/* Custom Input */}
            <CurrencyInput
              value={targetPrice}
              onChange={setTargetPrice}
              placeholder="Enter custom target price"
              currency="$"
              step="1"
              paddingLeft="pl-10"
              min="1"
              max="22222"
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
                className="mt-4 p-4 border-l-4 transition-all duration-300"
                style={{
                  backgroundColor: `var(--color-${currentTier.color}-50)`,
                  borderLeftColor: `var(--color-${currentTier.color}-400)`,
                }}
              >
                <p
                  className="text-display text-lg font-normal uppercase tracking-wide"
                  style={{ color: `var(--color-${currentTier.color}-800)` }}
                >
                  {currentTier.description}
                </p>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="mb-8">
            <div className="flex items-center justify-between ">
              <label className="block text-lg font-mono font-bold text-primary-800 ">
                Set amount of ETH to deposit
              </label>
              <div className="text-md text-paper-600  flex items-center">
                Min amount: 0.01 ETH
              </div>
            </div>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              currency="ETH"
              step="0.001"
              paddingLeft="pl-17"
              min="0.01"
            />
            {/* Constraint hint */}
            <div className="mt-2 text-xs text-gray-500">
              <span className="pr-2">Available balance:</span>
              <span>{getCurrentTokenBalance().toFixed(4)} ETH</span>
            </div>
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
            className="w-full bg-primary-800 hover:bg-primary-900 disabled:bg-paper-300 disabled:text-paper-500 text-white text-2xl font-mono font-bold py-4 px-6 transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
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
          lockPrice={ethPrice}
        />
      </div>
    </div>
  );
}
