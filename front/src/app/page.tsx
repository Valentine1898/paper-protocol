import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Paper Protocol
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A revolutionary decentralized platform that allows you to create token deposits 
            with smart price targets. Lock your assets and withdraw them automatically 
            when your target price is reached.
          </p>
          <Link 
            href="/deposit"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Start Depositing →
          </Link>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Paper Protocol?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Deposits</h3>
              <p className="text-gray-600">
                Create ETH and ERC20 token deposits with custom target prices. 
                Your funds are secured by smart contracts.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Price Targets</h3>
              <p className="text-gray-600">
                Set your desired withdrawal price. The system automatically 
                tracks market conditions using reliable price oracles.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">NFT Receipts</h3>
              <p className="text-gray-600">
                Receive unique NFT tokens that represent your deposits. 
                Trade, transfer, or hold them as proof of ownership.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Connect & Deposit</h3>
                <p className="text-gray-600 text-sm">
                  Connect your wallet and choose the token you want to deposit with your target price.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Monitor & Wait</h3>
                <p className="text-gray-600 text-sm">
                  Your deposit is secured while oracles monitor the market price of your asset.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Withdraw</h3>
                <p className="text-gray-600 text-sm">
                  When your target price is reached, withdraw your funds along with any gains.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join the future of decentralized finance with smart token deposits
            </p>
            <Link 
              href="/deposit"
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200 hover:bg-gray-100"
            >
              Create Your First Deposit
            </Link>
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
