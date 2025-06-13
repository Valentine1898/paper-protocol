# Paper Protocol Subgraph

🎯 **Status: ✅ Successfully Built and Ready for Deployment**

A complete subgraph implementation for the Paper Protocol - tracks token deposits, NFT transfers, and protocol analytics.

## 📊 What This Subgraph Tracks

### Core Events
- **Deposited**: When users deposit tokens with price targets (creates locks)
- **Transfer**: NFT transfers (ERC721 events)
- **OwnershipTransferred**: Contract ownership changes

### Entities
- **Users**: Wallet addresses with aggregated stats
- **Locks**: Individual token deposits with price targets
- **Tokens**: ERC20 tokens being locked
- **Protocol Stats**: Global protocol metrics
- **Daily Stats**: Time-series analytics
- **User Activities**: Activity feed for users

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- The Graph CLI: `npm install -g @graphprotocol/graph-cli`

### Setup
```bash
# Install dependencies
npm install

# Generate types from ABI
npm run codegen

# Build the subgraph
npm run build
```

### Deploy to Subgraph Studio
```bash
# Authenticate with your API key
graph auth --studio <ACCESS_TOKEN>

# Deploy to Subgraph Studio
graph deploy --studio paper-protocol-subgraph
```

### Deploy to Hosted Service
```bash
# Authenticate
graph auth --product hosted-service <ACCESS_TOKEN>

# Deploy
graph deploy --product hosted-service <GITHUB_USERNAME>/paper-protocol-subgraph
```

## 📁 Project Structure

```
├── schema.graphql          # GraphQL schema definitions
├── subgraph.yaml          # Subgraph configuration
├── src/
│   └── mapping.ts         # Event handlers and business logic
├── abis/
│   ├── PaperProtocol.json # Main contract ABI
│   └── ERC20.json         # Standard ERC20 ABI
├── config/                # Network-specific configurations
│   ├── mainnet.json
│   ├── polygon.json
│   └── arbitrum.json
└── generated/             # Auto-generated types (don't edit)
```

## 🔧 Configuration

### Network Deployment
Update `subgraph.yaml` with the correct:
- Contract address
- Start block
- Network name

Example networks configured:
- **Ethereum Mainnet**
- **Polygon**  
- **Arbitrum**

### Environment Variables
```bash
# For deployment
GRAPH_ACCESS_TOKEN=your_access_token_here
CONTRACT_ADDRESS=actual_deployed_contract_address
START_BLOCK=deployment_block_number
```

## 📊 Example Queries

### Get All Users with Their Stats
```graphql
query {
  users(first: 10, orderBy: totalValueLocked, orderDirection: desc) {
    id
    totalValueLocked
    totalLocks
    activeLocks
    successfulPredictions
    failedPredictions
    successRate
    firstSeenAt
    lastSeenAt
  }
}
```

### Get Active Locks
```graphql
query {
  locks(where: { isActive: true }, first: 20) {
    id
    user {
      id
    }
    token {
      symbol
      name
    }
    amount
    targetPrice
    lockPrice
    lockedAt
    duration
  }
}
```

### Get Protocol Statistics
```graphql
query {
  protocolStats(id: "protocol") {
    totalValueLocked
    totalUsers
    totalLocks
    activeLocks
    totalNFTsMinted
    overallSuccessRate
    allTimeHighTVL
    lastUpdatedAt
  }
}
```

### Get Daily Analytics
```graphql
query {
  dailyStats(first: 30, orderBy: date, orderDirection: desc) {
    id
    date
    totalValueLocked
    newUsers
    newLocks
    dailyVolume
    activeUsers
    successRate
  }
}
```

### Get User Activity Feed
```graphql
query GetUserActivities($user: Bytes!) {
  userActivities(
    where: { user: $user }
    first: 50
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    activityType
    timestamp
    lock {
      amount
      token {
        symbol
      }
    }
    transactionHash
  }
}
```

### Get Leaderboard by TVL
```graphql
query {
  users(
    first: 100
    orderBy: totalValueLocked
    orderDirection: desc
    where: { totalValueLocked_gt: "0" }
  ) {
    id
    totalValueLocked
    successRate
    totalLocks
    rank
  }
}
```

### Get Token Analytics
```graphql
query {
  tokens(first: 10, orderBy: totalValueLocked, orderDirection: desc) {
    id
    symbol
    name
    totalValueLocked
    activeLocks
    successfulPredictions
    failedPredictions
    currentPrice
    allTimeHigh
    allTimeLow
    firstSeenAt
  }
}
```

### Complex Query: User Performance
```graphql
query GetUserPerformance($userId: Bytes!) {
  user(id: $userId) {
    id
    totalValueLocked
    successfulPredictions
    failedPredictions
    successRate
    highestNFTRank
    totalLocks
    activeLocks
    firstSeenAt
    lastSeenAt
    
    locks(first: 10, orderBy: lockedAt, orderDirection: desc) {
      id
      amount
      targetPrice
      lockPrice
      lockedAt
      isActive
      targetReached
      token {
        symbol
        name
      }
    }
  }
  
  userActivities(
    where: { user: $userId }
    first: 20
    orderBy: timestamp
    orderDirection: desc
  ) {
    activityType
    timestamp
    transactionHash
  }
}
```

## 🏗️ Development

### Local Development
```bash
# Watch for changes and rebuild
npm run codegen -- --watch

# Build with verbose output
npm run build -- --debug
```

### Testing Queries
Use GraphiQL or Apollo Studio with your deployed subgraph endpoint:
```
https://api.thegraph.com/subgraphs/name/<USERNAME>/paper-protocol-subgraph
```

## 🛠️ Technical Implementation

### Event Handlers
- **handleDeposited**: Creates locks, updates user/token/protocol stats
- **handleTransfer**: Tracks NFT ownership changes
- **handleOwnershipTransferred**: Logs contract ownership changes

### Key Features
- ✅ Real-time protocol statistics
- ✅ User performance tracking
- ✅ Daily analytics aggregation
- ✅ Activity feed generation
- ✅ Token analytics
- ✅ Comprehensive error handling

### Data Integrity
- Automatic entity creation and linking
- Consistent state management
- Proper null handling
- BigInt/BigDecimal arithmetic

## 📈 Deployment Status

| Network | Status | Endpoint |
|---------|--------|----------|
| Mainnet | 🟡 Ready | Update with actual endpoint |
| Polygon | 🟡 Ready | Update with actual endpoint |
| Arbitrum | 🟡 Ready | Update with actual endpoint |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the Paper Protocol ecosystem 