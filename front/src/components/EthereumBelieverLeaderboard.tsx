"use client";

import { useState, useEffect, useCallback } from "react";
import { formatEther } from "viem";

// GraphQL query for Ethereum Believer Index leaderboard
const ETHEREUM_BELIEVER_LEADERBOARD_QUERY = `
  query GetEthereumBelieverLeaderboard($first: Int!) {
    ethPositions(
      orderBy: positionValue
      orderDirection: desc
      first: $first
    ) {
      id
      depositor
      amount
      targetPrice
      positionValue
    }
  }
`;

interface EthPosition {
  id: string;
  depositor: string;
  amount: string;
  targetPrice: string;
  positionValue: string;
}

interface LeaderboardData {
  ethPositions: EthPosition[];
}

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 
  "https://api.studio.thegraph.com/query/113895/paper-protocol/latest";

export default function EthereumBelieverLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(SUBGRAPH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: ETHEREUM_BELIEVER_LEADERBOARD_QUERY,
          variables: { first: limit }
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
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [limit]);

  const formatIndex = (value: string) => {
    if (!value || value === "0") return "0";
    
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
    
    console.log('=== formatAddress Debug ===');
    console.log('Original address:', address);
    console.log('Address type:', typeof address);
    console.log('Address length:', address.length);
    
    const lowerAddress = address.toLowerCase();
    console.log('Lowercase address:', lowerAddress);
    
    console.log('Available ENS addresses:', Object.keys(ensMap));
    console.log('Exact match check:', ensMap[lowerAddress]);
    console.log('Has property check:', ensMap.hasOwnProperty(lowerAddress));
    
    // Try to find exact match
    for (const [ensAddress, ensName] of Object.entries(ensMap)) {
      console.log(`Comparing "${lowerAddress}" with "${ensAddress}":`, lowerAddress === ensAddress);
      if (lowerAddress === ensAddress) {
        console.log('🎉 Found ENS match:', ensName);
        return ensName;
      }
    }
    
    console.log('❌ No ENS match found, returning truncated address');
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };



  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
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

  // Group positions by depositor and calculate total believer index
  const positions = data?.ethPositions || [];
  console.log('Raw positions from subgraph:', positions);
  
  interface UserStats {
    [depositor: string]: {
      depositor: string;
      totalBelieverIndex: bigint;
      totalEthLocked: bigint;
      positionCount: number;
    };
  }

  const userStats = positions.reduce((acc: UserStats, position: EthPosition) => {
    const depositor = position.depositor;
    if (!acc[depositor]) {
      acc[depositor] = {
        depositor,
        totalBelieverIndex: BigInt(0),
        totalEthLocked: BigInt(0),
        positionCount: 0
      };
    }
    
    acc[depositor].totalBelieverIndex += BigInt(position.positionValue);
    acc[depositor].totalEthLocked += BigInt(position.amount);
    acc[depositor].positionCount += 1;
    
    return acc;
  }, {});

  type UserStatsValue = UserStats[string];

  const users = Object.values(userStats)
    .sort((a: UserStatsValue, b: UserStatsValue) => {
      if (a.totalBelieverIndex > b.totalBelieverIndex) return -1;
      if (a.totalBelieverIndex < b.totalBelieverIndex) return 1;
      return 0;
    })
    .slice(0, limit);

  console.log('Processed users:', users);

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            🏆 Ethereum Believer Leaderboard
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>Top 10</option>
              <option value={25}>Top 25</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Believer Index
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                ETH Locked
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Positions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No users with ETH positions found
                </td>
              </tr>
            ) : (
              users.map((user: UserStatsValue, index: number) => (
                <tr
                  key={user.depositor}
                  className={`hover:bg-gray-50 ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {getRankEmoji(index + 1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const displayName = formatAddress(user.depositor);
                      const isEns = displayName.endsWith('.eth');
                      return (
                        <div className={`text-sm font-medium ${
                          isEns 
                            ? 'text-indigo-600 font-semibold' 
                            : 'text-gray-900 font-mono'
                        }`}>
                          {displayName}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-indigo-600">
                      Ξ {formatIndex(user.totalBelieverIndex.toString())}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Ξ {formatIndex(user.totalEthLocked.toString())}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.positionCount}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {users.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="text-sm text-gray-600 text-center">
            Showing top {users.length} believers • Updated every 30 seconds
          </div>
        </div>
      )}
    </div>
  );
} 