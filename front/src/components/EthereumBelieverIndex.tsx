"use client";

import { useState, useEffect } from "react";
import { formatEther } from "viem";

// GraphQL query for the simplified Ethereum Believer Index
const ETHEREUM_BELIEVER_INDEX_QUERY = `
  query GetEthereumBelieverIndex {
    ethereumBelieverIndex(id: "global") {
      totalIndex
      activePositions
      totalEthLocked
      lastUpdatedBlock
      lastUpdatedTimestamp
    }
    ethPositions(
      where: { isActive: true }
      first: 10
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

interface IndexData {
  ethereumBelieverIndex?: {
    totalIndex: string;
    activePositions: number;
    totalEthLocked: string;
    lastUpdatedBlock: string;
    lastUpdatedTimestamp: string;
  };
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
  "https://api.studio.thegraph.com/query/113895/paper-protocol/v0.0.9";

export default function EthereumBelieverIndex() {
  const [data, setData] = useState<IndexData | null>(null);
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
          query: ETHEREUM_BELIEVER_INDEX_QUERY,
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
      console.error("Error fetching Ethereum Believer Index:", err);
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <div className="text-red-800 font-semibold mb-2">Error Loading Index</div>
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

  const indexData = data?.ethereumBelieverIndex;
  const positions = data?.ethPositions || [];

  return (
    <div className="space-y-6">
      {/* Main Index Display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl shadow-lg border">
        <div className="text-center">
          <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            Ethereum Believer Index
          </div>
          <div className="text-4xl font-bold text-indigo-900 mb-2">
            Ξ {formatIndex(indexData?.totalIndex || "0")}
          </div>
          <div className="text-sm text-indigo-700">
            Total value of all ETH positions (amount × target price)
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {indexData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-semibold text-gray-600 mb-1">Active Positions</div>
            <div className="text-2xl font-bold text-purple-600">
              {indexData.activePositions}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-semibold text-gray-600 mb-1">Total ETH Locked</div>
            <div className="text-2xl font-bold text-orange-600">
              Ξ {formatIndex(indexData.totalEthLocked)}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-semibold text-gray-600 mb-1">Last Updated</div>
            <div className="text-sm font-mono text-gray-700">
              Block #{indexData.lastUpdatedBlock}
            </div>
          </div>
        </div>
      )}

      {/* Recent Positions */}
      {positions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent ETH Positions</h3>
          <div className="space-y-3">
            {positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {formatAddress(position.depositor)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(position.createdTimestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    Ξ {formatIndex(position.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Target: ${parseInt(position.targetPrice) / 1e18}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">What is the Ethereum Believer Index?</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            The Ethereum Believer Index measures the collective bullish sentiment for ETH in the Paper Protocol.
            It's calculated as the sum of all active ETH positions:
          </p>
          <p className="font-mono bg-white p-2 rounded border">
            Index = Σ(ETH Amount × Target Price)
          </p>
          <p>
            A higher index indicates stronger collective belief in ETH's future price appreciation.
            Each position represents a user's conviction that ETH will reach their target price.
          </p>
        </div>
      </div>
    </div>
  );
} 