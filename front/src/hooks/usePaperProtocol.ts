import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, createWalletClient, custom, http, parseEther, formatEther } from 'viem';
import { sepolia } from 'viem/chains';

// PaperProtocol contract ABI - main functions
const PAPER_PROTOCOL_ABI = [
  // Read functions
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'deposits',
    outputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'priceTarget', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'isPreset', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'isWithdrawn',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'nextTokenId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Write functions
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'priceTarget', type: 'uint256' }
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// Replace with actual contract address after deployment
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890' as const;

export interface Deposit {
  token: string;
  amount: bigint;
  priceTarget: bigint;
  timestamp: bigint;
  isPreset: boolean;
}

export function usePaperProtocol() {
  const { wallets } = useWallets();
  const wallet = wallets[0];

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  });

  // Helper function to create wallet client
  const createWalletClientAsync = async () => {
    if (!wallet) throw new Error('Wallet not connected');
    const provider = await wallet.getEthereumProvider();
    return createWalletClient({
      chain: sepolia,
      transport: custom(provider),
      account: wallet.address as `0x${string}`
    });
  };

  // Read functions
  const getDeposit = async (tokenId: number): Promise<Deposit | null> => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'deposits',
        args: [BigInt(tokenId)]
      });

      return {
        token: result[0],
        amount: result[1],
        priceTarget: result[2],
        timestamp: result[3],
        isPreset: result[4]
      };
    } catch (error) {
      console.error('Error getting deposit:', error);
      return null;
    }
  };

  const isWithdrawn = async (tokenId: number): Promise<boolean> => {
    try {
      return await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'isWithdrawn',
        args: [BigInt(tokenId)]
      });
    } catch (error) {
      console.error('Error checking if withdrawn:', error);
      return false;
    }
  };

  const getNextTokenId = async (): Promise<number> => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'nextTokenId'
      });
      return Number(result);
    } catch (error) {
      console.error('Error getting next token ID:', error);
      return 0;
    }
  };

  const getOwnerOf = async (tokenId: number): Promise<string | null> => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)]
      });
      return result;
    } catch (error) {
      console.error('Error getting owner:', error);
      return null;
    }
  };

  const getBalanceOf = async (address: string): Promise<number> => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      });
      return Number(result);
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  };

  // Write functions
  const depositEther = async (amount: string, priceTarget: string) => {
    const walletClient = await createWalletClientAsync();

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'deposit',
        args: [
          '0x0000000000000000000000000000000000000000', // address(0) for ETH
          BigInt(0), // amount will be msg.value
          parseEther(priceTarget)
        ],
        value: parseEther(amount)
      });

      return hash;
    } catch (error) {
      console.error('Error depositing ether:', error);
      throw error;
    }
  };

  const depositToken = async (tokenAddress: string, amount: string, priceTarget: string) => {
    const walletClient = await createWalletClientAsync();

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'deposit',
        args: [
          tokenAddress as `0x${string}`,
          parseEther(amount),
          parseEther(priceTarget)
        ]
      });

      return hash;
    } catch (error) {
      console.error('Error depositing token:', error);
      throw error;
    }
  };

  const withdraw = async (tokenId: number) => {
    const walletClient = await createWalletClientAsync();

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'withdraw',
        args: [BigInt(tokenId)]
      });

      return hash;
    } catch (error) {
      console.error('Error withdrawing:', error);
      throw error;
    }
  };

  return {
    // Contract info
    contractAddress: CONTRACT_ADDRESS,
    isConnected: !!wallet,
    userAddress: wallet?.address,
    
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
  };
} 