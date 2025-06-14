"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { usePaperProtocol } from "@/hooks/usePaperProtocol";

export default function WalletConnect() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const paperProtocol = usePaperProtocol();
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [isCorrectChain, setIsCorrectChain] = useState(true);
  const [switchingChain, setSwitchingChain] = useState(false);

  const loadBalance = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) return;

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    try {
      setLoading(true);
      const balanceWei = await publicClient.getBalance({
        address: user.wallet.address as `0x${string}`,
      });
      setBalance(formatEther(balanceWei));
    } catch (error) {
      console.error("Error loading balance:", error);
      setBalance("0");
    } finally {
      setLoading(false);
    }
  }, [authenticated, user?.wallet?.address]);

  // Stable reference to chain check function
  const isOnCorrectChainFn = useMemo(
    () => paperProtocol.isOnCorrectChain,
    [paperProtocol.isOnCorrectChain]
  );

  // Check chain status
  const checkChain = useCallback(async () => {
    if (authenticated && user?.wallet?.address && isOnCorrectChainFn) {
      const correct = await isOnCorrectChainFn();
      setIsCorrectChain(correct);
    }
  }, [authenticated, user?.wallet?.address, isOnCorrectChainFn]);

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      loadBalance();
      checkChain();
    }
  }, [authenticated, user?.wallet?.address, loadBalance, checkChain]);

  // Handle chain switch
  const handleSwitchChain = async () => {
    try {
      setSwitchingChain(true);
      await paperProtocol.switchToBaseSepolia();
      await checkChain();
      await loadBalance();
    } catch (error) {
      console.error("Error switching chain:", error);
    } finally {
      setSwitchingChain(false);
    }
  };

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
        className="bg-primary-900 hover:bg-primary-800 text-secondary font-bold font-mono px-4 py-3 rounded-sm transition-colors duration-200 text-md"
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
      {/* Network Status */}
      {!isCorrectChain && (
        <button
          onClick={handleSwitchChain}
          disabled={switchingChain}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          {switchingChain ? "Switching..." : "Switch to Base Sepolia"}
        </button>
      )}

      <div
        className={`border rounded-lg px-3 py-2 ${
          isCorrectChain
            ? "bg-gray-50 border-gray-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          <div>
            <div className="text-xs text-gray-500">Balance</div>
            <div className="text-sm font-medium">
              {loading ? "..." : `${parseFloat(balance).toFixed(4)} ETH`}
            </div>
          </div>
          <div className="border-l border-gray-300 h-8"></div>
          <div>
            <div className="text-xs text-gray-500">Address</div>
            <div className="text-sm font-mono">
              {user?.wallet?.address
                ? formatAddress(user.wallet.address)
                : "..."}
            </div>
          </div>
          {!isCorrectChain && (
            <>
              <div className="border-l border-gray-300 h-8"></div>
              <div>
                <div className="text-xs text-red-500">Wrong Network</div>
                <div className="text-xs text-red-600">
                  Switch to Base Sepolia
                </div>
              </div>
            </>
          )}
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
