# PaperProtocol Hooks

## usePaperProtocol()

A React hook for interacting with the PaperProtocol smart contract.

### Features

- **Read Functions**: Get deposits, check withdrawal status, get token information
- **Write Functions**: Create deposits (ETH/ERC20), withdraw funds
- **Utilities**: Format/parse Ether values, check connection status

### Usage

```typescript
import { usePaperProtocol } from '@/hooks/usePaperProtocol';

function MyComponent() {
  const {
    // Contract info
    contractAddress,
    isConnected,
    userAddress,
    
    // Read functions
    getDeposit,
    isWithdrawn,
    getNextTokenId,
    getOwnerOf,
    getBalanceOf,
    
    // Write functions
    depositEther,
    depositToken,
    withdraw,
    
    // Utils
    formatEther,
    parseEther
  } = usePaperProtocol();

  // Example: Create ETH deposit
  const handleDepositEth = async () => {
    try {
      const hash = await depositEther("0.1", "3000"); // 0.1 ETH, $3000 target
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  // Example: Get deposit info
  const getDepositInfo = async (tokenId: number) => {
    const deposit = await getDeposit(tokenId);
    if (deposit) {
      console.log('Amount:', formatEther(deposit.amount));
      console.log('Target price:', formatEther(deposit.priceTarget));
    }
  };
}
```

### Requirements

- Wallet must be connected via Privy
- Contract address needs to be updated after deployment
- Currently configured for Sepolia testnet

### Contract Functions

#### Read Functions
- `getDeposit(tokenId)` - Get deposit details by token ID
- `isWithdrawn(tokenId)` - Check if deposit is already withdrawn
- `getNextTokenId()` - Get the next available token ID
- `getOwnerOf(tokenId)` - Get owner of specific token
- `getBalanceOf(address)` - Get number of tokens owned by address

#### Write Functions
- `depositEther(amount, priceTarget)` - Create ETH deposit with target price
- `depositToken(tokenAddress, amount, priceTarget)` - Create ERC20 token deposit
- `withdraw(tokenId)` - Withdraw funds if price target is reached

### Configuration

Update the `CONTRACT_ADDRESS` constant in the hook after deploying the contract:

```typescript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS' as const;
``` 