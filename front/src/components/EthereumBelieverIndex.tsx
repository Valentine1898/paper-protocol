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

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 
  "https://api.studio.thegraph.com/query/113895/paper-protocol/latest";

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
      console.error("Error fetching leaderboard:", err);
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
      '0xe4984b5c26eeb6c3d5832cea6e0b38e8ffa2ef2e': 'tosic.eth',
      '0x4ffac681fae75170e96e8087b848e9ec4f4ca871': 'velaskes.eth',
      '0x163bceef1e94f3d82d0122f8791e9e5f214d438c': 'kolom.eth',
    };
    
    const lowerAddress = address.toLowerCase();
    return ensMap[lowerAddress] || `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Group positions by depositor for leaderboard
  const getLeaderboard = () => {
    if (!data?.ethPositions) return [];
    
    const walletMap = new Map<string, {
      depositor: string;
      totalPositionValue: bigint;
      positionsCount: number;
      totalEthLocked: bigint;
      positions: typeof data.ethPositions;
    }>();
    
    data.ethPositions.forEach((position) => {
      const existing = walletMap.get(position.depositor) || {
        depositor: position.depositor,
        totalPositionValue: BigInt(0),
        positionsCount: 0,
        totalEthLocked: BigInt(0),
        positions: []
      };
      
      existing.totalPositionValue += BigInt(position.positionValue);
      existing.positionsCount += 1;
      existing.totalEthLocked += BigInt(position.amount);
      existing.positions.push(position);
      
      walletMap.set(position.depositor, existing);
    });
    
    return Array.from(walletMap.values())
      .sort((a, b) => {
        if (a.totalPositionValue > b.totalPositionValue) return -1;
        if (a.totalPositionValue < b.totalPositionValue) return 1;
        return 0;
      });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
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
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <div className="text-red-800 font-semibold mb-2">Error Loading Leaderboard</div>
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={fetchData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const leaderboard = getLeaderboard();

  if (leaderboard.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <div className="text-gray-600">No active ETH positions yet.</div>
        <div className="text-sm text-gray-500 mt-2">Be the first believer!</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">🏆 ETH Believer Leaderboard</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Wallet</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Believer Index</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">ETH Locked</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Positions</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((wallet, index) => (
              <tr key={wallet.depositor} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {index === 0 && <span className="text-2xl">🥇</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && <span className="text-gray-600 font-medium text-lg">{index + 1}</span>}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {(() => {
                    const displayName = formatAddress(wallet.depositor);
                    const isEns = displayName.endsWith('.eth');
                    return (
                      <a 
                        href={`https://sepolia.basescan.io/address/${wallet.depositor}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:text-blue-800 text-sm ${
                          isEns 
                            ? 'text-indigo-600 font-semibold' 
                            : 'text-blue-600 font-mono'
                        }`}
                      >
                        {displayName}
                      </a>
                    );
                  })()}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="font-bold text-gray-800">
                    Ξ {formatIndex(wallet.totalPositionValue.toString())}
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  Ξ {formatIndex(wallet.totalEthLocked.toString())}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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