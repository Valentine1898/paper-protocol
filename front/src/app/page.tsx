export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Paper Protocol
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A decentralized platform built with cutting-edge web3 technology.
            Connect your wallet using the button in the top right corner to get started.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-3">💰</div>
                <h4 className="font-semibold text-gray-900 mb-2">Deposits</h4>
                <p className="text-gray-600 text-sm">Create ETH and ERC20 token deposits with target prices</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="font-semibold text-gray-900 mb-2">Price Targets</h4>
                <p className="text-gray-600 text-sm">Set withdrawal conditions based on price oracles</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-3">🏆</div>
                <h4 className="font-semibold text-gray-900 mb-2">NFT Receipts</h4>
                <p className="text-gray-600 text-sm">Get NFT tokens representing your deposits</p>
              </div>
            </div>
          </div>
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
