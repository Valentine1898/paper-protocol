import WalletConnect from '@/components/WalletConnect';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Paper Protocol
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A decentralized platform built with cutting-edge web3 technology.
            Connect your wallet to get started.
          </p>
        </div>
        
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <WalletConnect />
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Powered by Privy • Secure • Decentralized
          </p>
        </div>
      </div>
    </main>
  );
}
