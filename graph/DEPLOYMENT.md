# Paper Protocol Subgraph - Deployment Guide

## Prerequisites

1. **The Graph CLI installed globally:**
   ```bash
   npm install -g @graphprotocol/graph-cli
   ```

2. **Access to The Graph Studio:**
   - Visit [The Graph Studio](https://thegraph.com/studio/)
   - Connect your wallet
   - Create a new subgraph

3. **Contract addresses and deployment blocks ready**

## Deployment Steps

### 1. Configure Network Settings

Update the contract addresses and start blocks in the config files:

**For Ethereum Mainnet:**
```bash
# Edit config/mainnet.json
{
  "network": "mainnet",
  "contractAddress": "0x...", // Replace with actual Paper Protocol contract address
  "startBlock": 18000000      // Replace with actual deployment block
}
```

**For Polygon:**
```bash
# Edit config/polygon.json
{
  "network": "matic",
  "contractAddress": "0x...", // Replace with actual contract address
  "startBlock": 45000000      // Replace with actual deployment block
}
```

**For Arbitrum:**
```bash
# Edit config/arbitrum.json
{
  "network": "arbitrum-one",
  "contractAddress": "0x...", // Replace with actual contract address
  "startBlock": 100000000     // Replace with actual deployment block
}
```

### 2. Update Contract ABIs

Replace the placeholder ABI files with the actual contract ABIs:

1. **Paper Protocol Contract ABI:**
   - Replace `abis/PaperProtocol.json` with the actual ABI
   - Ensure all events are properly defined

2. **Verify event signatures in `subgraph.template.yaml` match the ABI**

### 3. Generate Network-Specific Configuration

```bash
# For Ethereum mainnet
npm run prepare:mainnet

# For Polygon
npm run prepare:polygon

# For Arbitrum
npm run prepare:arbitrum
```

### 4. Generate TypeScript Types

```bash
npm run codegen
```

### 5. Build the Subgraph

```bash
npm run build
```

### 6. Deploy to The Graph Studio

1. **Authenticate with The Graph Studio:**
   ```bash
   graph auth --studio <DEPLOY_KEY>
   ```

2. **Deploy the subgraph:**
   ```bash
   npm run deploy-studio
   ```

## Network-Specific Deployments

### Ethereum Mainnet

```bash
npm run prepare:mainnet
npm run codegen
npm run build
npm run deploy-studio
```

### Polygon

```bash
npm run prepare:polygon
npm run codegen  
npm run build
npm run deploy-studio
```

### Arbitrum

```bash
npm run prepare:arbitrum
npm run codegen
npm run build
npm run deploy-studio
```

## Local Development Setup

### Start Local Graph Node

```bash
# Start local infrastructure
docker-compose up -d

# Create subgraph locally
npm run create-local

# Deploy locally
npm run deploy-local
```

### Access Local Services

- **Graph Node:** http://localhost:8000
- **GraphQL Playground:** http://localhost:8000/subgraphs/name/paper-protocol/paper-protocol-subgraph
- **IPFS:** http://localhost:5001
- **PostgreSQL:** localhost:5432

## Post-Deployment Verification

### 1. Check Indexing Status

Visit The Graph Studio and verify:
- Subgraph is syncing
- No indexing errors
- Data is being populated

### 2. Test GraphQL Queries

```graphql
# Basic protocol stats query
query {
  protocolStats(id: "protocol-stats") {
    totalValueLocked
    totalUsers
    totalLocks
    activeLocks
  }
}

# Recent locks query
query {
  locks(first: 10, orderBy: lockedAt, orderDirection: desc) {
    id
    user {
      id
    }
    token {
      symbol
    }
    amount
    targetPrice
    lockedAt
  }
}
```

### 3. Monitor Performance

- Check sync status regularly
- Monitor query performance
- Watch for any indexing errors

## Troubleshooting

### Common Issues

1. **Indexing Errors:**
   - Verify contract addresses are correct
   - Check start block is not too early
   - Ensure ABI matches contract

2. **Performance Issues:**
   - Consider reducing start block if too much historical data
   - Optimize query patterns
   - Monitor resource usage

3. **Data Inconsistencies:**
   - Verify event handler logic
   - Check entity relationships
   - Test with known transactions

### Support

- [The Graph Discord](https://discord.gg/graphprotocol)
- [The Graph Documentation](https://thegraph.com/docs/)
- [Paper Protocol Documentation](https://docs.paper-protocol.com)

## Security Considerations

- Never commit private keys or deploy keys to version control
- Use environment variables for sensitive configuration
- Regularly update dependencies
- Monitor for unusual activity or data patterns

## Maintenance

### Regular Tasks

1. **Monitor indexing health**
2. **Update to latest Graph CLI versions**
3. **Optimize queries based on usage patterns**
4. **Backup subgraph configuration**

### Updates

When updating the subgraph:
1. Increment version in `package.json`
2. Test changes locally first
3. Deploy to testnet before mainnet
4. Monitor closely after deployment 