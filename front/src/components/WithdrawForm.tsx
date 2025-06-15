"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther } from "viem";
import { usePaperProtocol } from "@/hooks/usePaperProtocol";
import { useETHPrice } from "@/hooks/useETHPrice";
import NFTCard from "./NFTCard";
import toast from "react-hot-toast";

// GraphQL query for user's ETH positions
const USER_ETH_POSITIONS_QUERY = `
  query GetUserEthPositions($depositor: String!) {
    ethPositions(
      where: { depositor: $depositor, isActive: true }
      first: 100
      orderBy: createdTimestamp
      orderDirection: desc
    ) {
      id
      depositor
      amount
      targetPrice
      positionValue
      createdTimestamp
      transactionHash
    }
  }
`;

interface EthPosition {
  id: string;
  depositor: string;
  amount: string;
  targetPrice: string;
  positionValue: string;
  createdTimestamp: string;
  transactionHash: string;
}

const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  "https://api.studio.thegraph.com/query/113895/paper-protocol/latest";

export default function WithdrawForm() {
  const { authenticated, user } = usePrivy();
  const paperProtocol = usePaperProtocol();
  const [positions, setPositions] = useState<EthPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const { price: ethPrice, loading: ethPriceLoading } = useETHPrice();

  // Fetch user's positions
  const fetchPositions = useCallback(async () => {
    if (!user?.wallet?.address) return;

    try {
      setLoading(true);
      const response = await fetch(SUBGRAPH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: USER_ETH_POSITIONS_QUERY,
          variables: { depositor: user.wallet.address.toLowerCase() },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setPositions(result.data.ethPositions || []);
    } catch {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  }, [user?.wallet?.address]);

  console.log(positions);

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      fetchPositions();
    }
  }, [authenticated, user?.wallet?.address, fetchPositions]);

  const formatAmount = (value: string) => {
    const ethValue = formatEther(BigInt(value));
    return parseFloat(ethValue).toFixed(4);
  };

  const formatPrice = (value: string) => {
    const ethValue = formatEther(BigInt(value));
    return parseFloat(ethValue).toFixed(2);
  };

  const isTargetReached = (targetPrice: string) => {
    const target = parseFloat(formatEther(BigInt(targetPrice)));
    return ethPrice >= target;
  };

  const handleWithdraw = async (positionId: string) => {
    if (!paperProtocol.isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setWithdrawing(positionId);
      const loadingToast = toast.loading("Processing withdrawal...");

      // Convert position ID to number (assuming it's a numeric string)
      const tokenId = parseInt(positionId);

      // Call the withdraw function on the contract
      const hash = await paperProtocol.withdraw(tokenId);

      toast.dismiss(loadingToast);
      toast.success(
        `Withdrawal successful! Transaction: ${hash.slice(0, 10)}...`
      );

      // Refresh positions after a delay
      setTimeout(async () => {
        await fetchPositions();
        setWithdrawing(null);
      }, 5000);
    } catch {
      toast.error("Withdrawal failed. Please try again.");
      setWithdrawing(null);
    }
  };

  if (!authenticated) {
    return (
      <div className="bg-white border border-paper-200 shadow-sm p-8">
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
            Please connect your wallet to view your positions
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 p-4 rounded">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="bg-white p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Active Positions
          </h3>
          <p className="text-gray-600">
            You don&apos;t have any active ETH positions yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-9 pt-8">
      <div className="mb-6">
        <h3 className="text-lg font-mono font-bold text-primary-800 mb-2">
          Your Active Positions
        </h3>
      </div>

      {/* NFT Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positions.map((position) => {
          const targetReached = isTargetReached(position.targetPrice);
          const targetPrice = parseFloat(formatPrice(position.targetPrice));

          return (
            <div
              key={position.id}
              className={`border-2 rounded-lg overflow-hidden transition-all ${
                targetReached
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* NFT Card */}
              <div className="p-4">
                <NFTCard
                  amount={formatAmount(position.amount)}
                  targetPrice={targetPrice.toString()}
                  lockPrice={ethPrice}
                  hideTitle={true}
                  hideNote={true}
                />
              </div>

              {/* Position Info */}
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount Locked</span>
                  <span className="font-mono font-bold">
                    Ξ {formatAmount(position.amount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Target Price</span>
                  <span className="font-mono font-bold">
                    ${targetPrice.toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Position #{position.id}
                </div>

                {/* Withdraw button */}
                {targetReached && (
                  <button
                    onClick={() => handleWithdraw(position.id)}
                    disabled={withdrawing === position.id}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-mono font-bold py-2 px-4 rounded transition-all duration-200"
                  >
                    {withdrawing === position.id
                      ? "Withdrawing..."
                      : "🎯 Withdraw"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
