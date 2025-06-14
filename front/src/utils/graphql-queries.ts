// GraphQL queries for Paper Protocol data

export const ETHEREUM_BELIEVER_INDEX_QUERY = `
  query GetEthereumBelieverIndex {
    protocolStats(id: "protocol") {
      ethereumBelieverIndex
      totalValueLocked
      activeLocks
      lastUpdatedAt
    }
    ethereumBelieverIndex(id: "ethereum-believer-index") {
      currentIndex
      allTimeHigh
      allTimeLow
      activePositions
      totalEthLocked
      averageTargetPrice
      lastUpdatedAt
    }
    ethereumBelieverSnapshots(
      orderBy: timestamp
      orderDirection: desc
      first: 10
    ) {
      id
      value
      activePositions
      totalEthLocked
      averageTargetPrice
      timestamp
      eventType
    }
  }
`;

export const ETH_LOCKS_QUERY = `
  query GetEthLocks($first: Int!, $skip: Int!) {
    locks(
      where: { 
        token: "0x0000000000000000000000000000000000000000"
        isActive: true 
      }
      first: $first
      skip: $skip
      orderBy: lockedAt
      orderDirection: desc
    ) {
      id
      user {
        id
      }
      amount
      targetPrice
      lockPrice
      lockedAt
      isActive
      transactionHash
    }
  }
`;

export const PROTOCOL_STATS_QUERY = `
  query GetProtocolStats {
    protocolStats(id: "protocol") {
      totalValueLocked
      totalUsers
      totalLocks
      activeLocks
      ethereumBelieverIndex
      totalSuccessfulPredictions
      totalFailedPredictions
      overallSuccessRate
      lastUpdatedAt
    }
  }
`;

export const DAILY_STATS_QUERY = `
  query GetDailyStats($first: Int!) {
    dailyStats(
      orderBy: date
      orderDirection: desc
      first: $first
    ) {
      id
      date
      totalValueLocked
      ethereumBelieverIndex
      newLocks
      unlocks
      dailyVolume
      activeUsers
      successRate
    }
  }
`;

export const USER_ETH_POSITIONS_QUERY = `
  query GetUserEthPositions($userAddress: String!) {
    user(id: $userAddress) {
      id
      totalValueLocked
      totalLocks
      activeLocks
      ethereumBelieverIndex
      activeEthPositions
      totalEthLocked
      ethereumBelieverRank
      locks(
        where: { 
          token: "0x0000000000000000000000000000000000000000"
        }
        orderBy: lockedAt
        orderDirection: desc
      ) {
        id
        amount
        targetPrice
        lockPrice
        lockedAt
        isActive
        unlockedAt
        targetReached
        transactionHash
      }
    }
  }
`;

export const ETHEREUM_BELIEVER_LEADERBOARD_QUERY = `
  query GetEthereumBelieverLeaderboard($first: Int!) {
    users(
      where: { ethereumBelieverIndex_gt: "0" }
      orderBy: ethereumBelieverIndex
      orderDirection: desc
      first: $first
    ) {
      id
      ethereumBelieverIndex
      activeEthPositions
      totalEthLocked
      totalLocks
      successfulPredictions
      failedPredictions
      successRate
      firstSeenAt
      lastSeenAt
    }
  }
`;

// Helper function to calculate individual position value
export const calculatePositionValue = (amount: string, targetPrice: string): string => {
  const amountBN = BigInt(amount);
  const targetPriceBN = BigInt(targetPrice);
  return (amountBN * targetPriceBN).toString();
};

// Helper function to format GraphQL query with variables
export const formatQuery = (query: string, variables?: Record<string, unknown>) => {
  return {
    query,
    variables: variables || {}
  };
}; 