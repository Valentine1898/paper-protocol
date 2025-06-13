import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, createWalletClient, custom, http, parseEther, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useCallback, useMemo } from 'react';
import PaperProtocolABI from '../../abi/PaperProtocol.json';

interface WalletError {
  code?: number;
  message?: string;
}

// Use the imported ABI
const PAPER_PROTOCOL_ABI = PaperProtocolABI.abi;

// Real contract addresses on Base Sepolia
const CONTRACT_ADDRESS = '0x14C59Ba26193C65d256C41f1077c8867eB41c805' as const;

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

  const publicClient = useMemo(() => createPublicClient({
    chain: baseSepolia,
    transport: http()
  }), []);

  // Helper function to create wallet client
  const createWalletClientAsync = useCallback(async () => {
    if (!wallet) throw new Error('Wallet not connected');
    const provider = await wallet.getEthereumProvider();
    
    // Check current chain and switch if needed
    try {
      const currentChainId = await provider.request({ method: 'eth_chainId' });
      const targetChainId = `0x${baseSepolia.id.toString(16)}`;
      
      if (currentChainId !== targetChainId) {
        try {
          // Try to switch to Base Sepolia
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError: unknown) {
          // If the chain is not added, add it
          if ((switchError as WalletError).code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia-explorer.base.org'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error('Error switching chain:', error);
      throw new Error('Failed to switch to Base Sepolia network');
    }
    
    return createWalletClient({
      chain: baseSepolia,
      transport: custom(provider),
      account: wallet.address as `0x${string}`
    });
  }, [wallet]);

  // Read functions
  const getDeposit = useCallback(async (tokenId: number): Promise<Deposit | null> => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'deposits',
        args: [BigInt(tokenId)]
      }) as [string, bigint, bigint, bigint, boolean];

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
  }, [publicClient]);

  const isWithdrawn = useCallback(async (tokenId: number): Promise<boolean> => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'isWithdrawn',
        args: [BigInt(tokenId)]
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking if withdrawn:', error);
      return false;
    }
  }, [publicClient]);

  const getNextTokenId = useCallback(async (): Promise<number> => {
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
  }, [publicClient]);

  const getOwnerOf = useCallback(async (tokenId: number): Promise<string | null> => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: PAPER_PROTOCOL_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)]
      });
      return result as string;
    } catch (error) {
      console.error('Error getting owner:', error);
      return null;
    }
  }, [publicClient]);

  const getBalanceOf = useCallback(async (address: string): Promise<number> => {
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
  }, [publicClient]);

  // Write functions
  const depositEther = useCallback(async (amount: string, priceTarget: string) => {
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
  }, [createWalletClientAsync]);

  const depositToken = useCallback(async (tokenAddress: string, amount: string, priceTarget: string) => {
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
  }, [createWalletClientAsync]);

  const withdraw = useCallback(async (tokenId: number) => {
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
  }, [createWalletClientAsync]);

  // Check if wallet is on correct chain
  const isOnCorrectChain = useCallback(async (): Promise<boolean> => {
    if (!wallet) return false;
    try {
      const provider = await wallet.getEthereumProvider();
      const currentChainId = await provider.request({ method: 'eth_chainId' });
      const targetChainId = `0x${baseSepolia.id.toString(16)}`;
      return currentChainId === targetChainId;
    } catch (error) {
      console.error('Error checking chain:', error);
      return false;
    }
  }, [wallet]);

  // Switch to Base Sepolia
  const switchToBaseSepolia = useCallback(async () => {
    if (!wallet) throw new Error('Wallet not connected');
    const provider = await wallet.getEthereumProvider();
    const targetChainId = `0x${baseSepolia.id.toString(16)}`;
    
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: unknown) {
      if ((switchError as WalletError).code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: targetChainId,
            chainName: 'Base Sepolia',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.base.org'],
            blockExplorerUrls: ['https://sepolia-explorer.base.org'],
          }],
        });
      } else {
        throw switchError;
      }
    }
  }, [wallet]);

  return {
    // Contract info
    contractAddress: CONTRACT_ADDRESS,
    isConnected: !!wallet,
    userAddress: wallet?.address,
    
    // Chain functions
    isOnCorrectChain,
    switchToBaseSepolia,
    
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