'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function WalletConnect() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      {!authenticated ? (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Connect your wallet to access web3 features
          </p>
          <button
            onClick={login}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Wallet Connected!
            </h2>
            {user?.wallet?.address && (
              <p className="text-sm text-green-600 font-mono break-all">
                {user.wallet.address}
              </p>
            )}
            {user?.email?.address && (
              <p className="text-sm text-green-600 mt-1">
                Email: {user.email.address}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
} 