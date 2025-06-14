import StartDepositingButton from "@/components/StartDepositingButton";
import Header from "@/components/Header";
import EthereumBelieverIndex from "@/components/EthereumBelieverIndex";

export default function Home() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-8 mt-0">
            <h1 className="text-7xl text-display text-gray-900 mb-9">
              The world&apos;s first <br />
              &quot;target price or nothing&quot; <br />
              protocol - because compromise <br />
              is for the weak
            </h1>

            <div className="flex items-center justify-center w-full text-lg text-gray-900/50 mb-8 font-mono font-bold">
              We don&apos;t just help forge paper hands into diamond hands - we{" "}
              <br />
              guarantee it through smart contract
            </div>

            <StartDepositingButton className=" mb-28" />
            <div className="flex items-center justify-center w-full text-2xl text-gray-900 mb-20 font-mono font-bold">
              <img
                src="/diamond-icon.svg"
                alt="Paper Protocol"
                className="h-12
                 hover:opacity-80 transition-opacity duration-200"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto mb-16 items-center justify-center">
            <div className="flex items-center justify-center w-full ">
              <h1 className="text-6xl text-display text-gray-900 mb-12">
                How does it work?
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Smart Deposits
                </h3>
                <p className="text-gray-600">
                  Create ETH and ERC20 token deposits with custom target prices.
                  Your funds are secured by smart contracts.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Price Targets
                </h3>
                <p className="text-gray-600">
                  Set your desired withdrawal price. The system automatically
                  tracks market conditions using reliable price oracles.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  NFT Receipts
                </h3>
                <p className="text-gray-600">
                  Receive unique NFT tokens that represent your deposits. Trade,
                  transfer, or hold them as proof of ownership.
                </p>
              </div>
            </div>
          </div>

          <div />
        </div>
        
        {/* Ethereum Believer Leaderboard Section */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <EthereumBelieverIndex />
        </div>
      </main>
    </div>
  );
}
