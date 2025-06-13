'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePaperProtocol } from '@/hooks/usePaperProtocol';
import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import PresetInput from './PresetInput';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Supported tokens
const SUPPORTED_TOKENS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    icon: 'Ξ'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    decimals: 6,
    icon: '💰'
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6', // Sepolia DAI
    decimals: 18,
    icon: '🪙'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH
    decimals: 18,
    icon: '🔄'
  }
];

interface TokenBalance {
  symbol: string;
  balance: string;
  formattedBalance: string;
}

export default function DepositForm() {
  const { authenticated, user } = usePrivy();
  const paperProtocol = usePaperProtocol();
  
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(false);

  const loadTokenBalances = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) return;

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    });

    try {
      setLoadingBalances(true);
      const balances: TokenBalance[] = [];

      for (const token of SUPPORTED_TOKENS) {
        let balance = '0';
        
        if (token.address === '0x0000000000000000000000000000000000000000') {
          // ETH balance
          const ethBalance = await publicClient.getBalance({
            address: user.wallet.address as `0x${string}`
          });
          balance = ethBalance.toString();
        } else {
          // ERC20 balance
          try {
            const tokenBalance = await publicClient.readContract({
              address: token.address as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [user.wallet.address as `0x${string}`]
            });
            balance = tokenBalance.toString();
          } catch (error) {
            console.error(`Error loading ${token.symbol} balance:`, error);
          }
        }

        const formattedBalance = formatEther(BigInt(balance));
        balances.push({
          symbol: token.symbol,
          balance,
          formattedBalance: parseFloat(formattedBalance).toFixed(4)
        });
      }

      setTokenBalances(balances);
    } catch (error) {
      console.error('Error loading token balances:', error);
    } finally {
      setLoadingBalances(false);
    }
  }, [authenticated, user?.wallet?.address]);

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      loadTokenBalances();
    }
  }, [authenticated, user?.wallet?.address, loadTokenBalances]);

  const getCurrentTokenBalance = () => {
    const balance = tokenBalances.find(b => b.symbol === selectedToken.symbol);
    return balance ? parseFloat(balance.formattedBalance) : 0;
  };

  const getAmountPresets = () => {
    if (selectedToken.symbol === 'ETH') {
      return [
        { label: 'Preset 1', value: formatEther(BigInt('1000000000000000')) }, // 0.001 ETH
        { label: 'Preset 2', value: formatEther(BigInt('10000000000000000')) }, // 0.01 ETH
        { label: 'Preset 3', value: formatEther(BigInt('50000000000000000')) } // 0.05 ETH
      ];
    } else {
      // Mock Token presets
      return [
        { label: 'Preset 1', value: formatEther(BigInt('100000000000000000000')) }, // 100 tokens
        { label: 'Preset 2', value: formatEther(BigInt('100000000000000000000')) }, // 100 tokens
        { label: 'Preset 3', value: formatEther(BigInt('100000000000000000000')) } // 100 tokens
      ];
    }
  };

  const getPricePresets = () => {
    if (selectedToken.symbol === 'ETH') {
      return [
        { label: 'Preset 1', value: formatEther(BigInt('3000000000000000000000')) }, // 3000 USD
        { label: 'Preset 2', value: formatEther(BigInt('4000000000000000000000')) }, // 4000 USD
        { label: 'Preset 3', value: formatEther(BigInt('6000000000000000000000')) } // 6000 USD
      ];
    } else {
      // Mock Token presets
      return [
        { label: 'Preset 1', value: formatEther(BigInt('1500000000000000000')) }, // 1.5 USD
        { label: 'Preset 2', value: formatEther(BigInt('2000000000000000000')) }, // 2 USD
        { label: 'Preset 3', value: formatEther(BigInt('3000000000000000000')) } // 3 USD
      ];
    }
  };

  const handleDeposit = async () => {
    if (!authenticated || !amount || !targetPrice) return;

    try {
      setLoading(true);
      
      let hash;
      if (selectedToken.address === '0x0000000000000000000000000000000000000000') {
        // ETH deposit
        hash = await paperProtocol.depositEther(amount, targetPrice);
      } else {
        // ERC20 deposit
        hash = await paperProtocol.depositToken(selectedToken.address, amount, targetPrice);
      }

      alert(`Deposit transaction sent! Hash: ${hash}`);
      
      // Reset form
      setAmount('');
      setTargetPrice('');
      
      // Reload balances
      setTimeout(loadTokenBalances, 2000);
      
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Deposit</h3>
          <p className="text-gray-600">Please connect your wallet to create deposits</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Create Deposit</h3>
      
      {/* Token Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Token
        </label>
        <div className="relative">
          <select
            value={selectedToken.symbol}
            onChange={(e) => {
              const token = SUPPORTED_TOKENS.find(t => t.symbol === e.target.value);
              if (token) setSelectedToken(token);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {SUPPORTED_TOKENS.map((token) => {
              const balance = tokenBalances.find(b => b.symbol === token.symbol);
              return (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol} - {token.name} 
                  {balance && ` (${balance.formattedBalance})`}
                </option>
              );
            })}
          </select>
        </div>
        {loadingBalances && (
          <p className="text-xs text-gray-500 mt-1">Loading balances...</p>
        )}
      </div>

      {/* Amount Input */}
      <PresetInput
        label={`Amount (${selectedToken.symbol})`}
        value={amount}
        onChange={setAmount}
        presets={getAmountPresets()}
        placeholder={`Enter ${selectedToken.symbol} amount`}
        step="0.0001"
        presetButtonColor="blue"
        helperText={`Available: ${getCurrentTokenBalance().toFixed(4)} ${selectedToken.symbol}`}
      />

      {/* Target Price Input */}
      <PresetInput
        label="Target Price (USD)"
        value={targetPrice}
        onChange={setTargetPrice}
        presets={getPricePresets()}
        placeholder="Enter target price in USD"
        step="0.01"
        presetButtonColor="green"
      />

      {/* Submit Button */}
      <button
        onClick={handleDeposit}
        disabled={loading || !amount || !targetPrice || !paperProtocol.isConnected}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? 'Creating Deposit...' : 'Create Deposit'}
      </button>

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p><strong>Note:</strong> You will receive an NFT representing your deposit. You can withdraw your funds when the target price is reached.</p>
      </div>
    </div>
  );
} 