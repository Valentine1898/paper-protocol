"use client";

import { useState, useEffect } from "react";
import { formatEther } from "viem";

// GraphQL query for the leaderboard
const ETHEREUM_BELIEVER_LEADERBOARD_QUERY = `
  query GetEthereumBelieverLeaderboard {
    ethPositions(
      where: { isActive: true }
      first: 100
      orderBy: positionValue
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

interface LeaderboardData {
  ethPositions: Array<{
    id: string;
    depositor: string;
    amount: string;
    targetPrice: string;
    positionValue: string;
    createdTimestamp: string;
    transactionHash: string;
  }>;
}


const SUBGRAPH_URL =
  "https://api.studio.thegraph.com/query/113895/paper-protocol/v1.1.1";

export default function EthereumBelieverIndex() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(SUBGRAPH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: ETHEREUM_BELIEVER_LEADERBOARD_QUERY,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatIndex = (value: string) => {
    if (!value || value === "0") return "0";

    // Convert from wei to ether and format
    const ethValue = formatEther(BigInt(value));
    const numValue = parseFloat(ethValue);

    if (numValue >= 1e9) {
      return `${(numValue / 1e9).toFixed(2)}B`;
    } else if (numValue >= 1e6) {
      return `${(numValue / 1e6).toFixed(2)}M`;
    } else if (numValue >= 1e3) {
      return `${(numValue / 1e3).toFixed(2)}K`;
    }

    return numValue.toFixed(4);
  };

  const formatAddress = (address: string) => {
    // ENS mapping with addresses in lowercase for easier matching
    const ensMap: { [key: string]: string } = {
      "0xe4984b5c26eeb6c3d5832cea6e0b38e8ffa2ef2e": "tosik.eth",
      "0x4ffac681fae75170e96e8087b848e9ec4f4ca871": "velaskes.eth",
      "0x163bceef1e94f3d82d0122f8791e9e5f214d438c": "kolom.eth",
    };

    const lowerAddress = address.toLowerCase();
    return (
      ensMap[lowerAddress] || `${address.slice(0, 6)}...${address.slice(-4)}`
    );
  };

  // Group positions by depositor for leaderboard
  const getLeaderboard = () => {
    if (!data?.ethPositions) return [];

    const walletMap = new Map<
      string,
      {
        depositor: string;
        totalPositionValue: bigint;
        positionsCount: number;
        totalEthLocked: bigint;
        positions: typeof data.ethPositions;
      }
    >();

    data.ethPositions.forEach((position) => {
      const existing = walletMap.get(position.depositor) || {
        depositor: position.depositor,
        totalPositionValue: BigInt(0),
        positionsCount: 0,
        totalEthLocked: BigInt(0),
        positions: [],
      };

      existing.totalPositionValue += BigInt(position.positionValue);
      existing.positionsCount += 1;
      existing.totalEthLocked += BigInt(position.amount);
      existing.positions.push(position);

      walletMap.set(position.depositor, existing);
    });

    return Array.from(walletMap.values()).sort((a, b) => {
      if (a.totalPositionValue > b.totalPositionValue) return -1;
      if (a.totalPositionValue < b.totalPositionValue) return 1;
      return 0;
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-9 pt-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-9 pt-8">
        <div className="bg-red-50 border-2 border-red-200 p-4">
          <div className="text-red-800 font-mono font-bold mb-2">
            Error Loading Leaderboard
          </div>
          <div className="text-red-600 text-sm">{error}</div>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-mono font-bold transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const leaderboard = getLeaderboard();

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white p-9 pt-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-display text-xl font-normal text-primary-900 mb-2">
            No Active Positions Yet
          </h3>
          <p className="text-body text-paper-600">Be the first ETH believer!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="  pt-8 mb-24">
      <div className="flex items-center justify-center mb-4">
        <h3 className="text-5xl text-display text-primary-800 mb-6">
          ETH Believer Leaderboard
        </h3>
      </div>
      <div className="overflow-x-auto bg-white p-9 py-4 ">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-paper-200">
              <th className="text-left py-3 px-0 font-mono font-bold text-primary-800 text-sm">
                Rank
              </th>
              <th className="text-left py-3 px-4 font-mono font-bold text-primary-800 text-sm">
                Wallet
              </th>
              <th className="text-right py-3 px-4 font-mono font-bold text-primary-800 text-sm">
                Believer Index
              </th>
              <th className="text-right py-3 px-4 font-mono font-bold text-primary-800 text-sm">
                ETH Locked
              </th>
              <th className="text-center py-3 px-4 font-mono font-bold text-primary-800 text-sm">
                Positions
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((wallet, index) => (
              <tr
                key={wallet.depositor}
                className="border-b border-paper-100 hover:bg-paper-50 transition-colors"
              >
                <td className="py-4 px-0">
                  <div className="flex items-center space-x-2">
                    {index === 0 && <span className="text-2xl">🥇</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && (
                      <span className="text-primary-900/60 font-mono font-bold text-lg">
                        {index + 1}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {(() => {
                    const displayName = formatAddress(wallet.depositor);
                    const isEns = displayName.endsWith(".eth");
                    return (
                      <a
                        href={`https://sepolia.basescan.io/address/${wallet.depositor}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`transition-colors duration-200 ${
                          isEns
                            ? "text-primary-800 hover:text-primary-900 font-display text-base"
                            : "text-primary-600 hover:text-primary-800 font-mono font-bold text-sm"
                        }`}
                      >
                        {displayName}
                      </a>
                    );
                  })()}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="font-mono font-bold text-primary-900 text-lg">
                    {formatIndex(wallet.totalPositionValue.toString())}
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-mono font-bold text-primary-900/60">
                  Ξ {formatIndex(wallet.totalEthLocked.toString())}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-mono font-bold bg-primary-100 text-primary-800">
                    {wallet.positionsCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
