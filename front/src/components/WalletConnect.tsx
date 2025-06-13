'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';

export default function WalletConnect() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const loadBalance = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) return;

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    });

    try {
      setLoading(true);
      const balanceWei = await publicClient.getBalance({
        address: user.wallet.address as `0x${string}`
      });
      setBalance(formatEther(balanceWei));
    } catch (error) {
      console.error('Error loading balance:', error);
      setBalance('0');
    } finally {
      setLoading(false);
    }
  }, [authenticated, user?.wallet?.address]);

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      loadBalance();
    }
  }, [authenticated, user?.wallet?.address, loadBalance]);

  if (!ready) {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
      >
        Connect Wallet
      </button>
    );
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <div>
            <div className="text-xs text-gray-500">Balance</div>
            <div className="text-sm font-medium">
              {loading ? '...' : `${parseFloat(balance).toFixed(4)} ETH`}
            </div>
          </div>
          <div className="border-l border-gray-300 h-8"></div>
          <div>
            <div className="text-xs text-gray-500">Address</div>
            <div className="text-sm font-mono">
              {user?.wallet?.address ? formatAddress(user.wallet.address) : '...'}
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
        title="Disconnect"
      >
        ✕
      </button>
    </div>
  );
} 