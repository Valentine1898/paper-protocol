import DepositForm from "@/components/DepositForm";
import Header from "@/components/Header";
import EthereumBelieverIndex from "@/components/EthereumBelieverIndex";

export default function DepositPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header showWalletConnect={true} />

      <main className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 pt-12 pb-4">
          <div className="text-center mb-12">
            <h2 className="text-display text-5xl font-normal text-primary-900 mb-4">
              Create ETH Position
            </h2>

            <p className="text-mono text-sm lg:text-base text-primary-500 font-bold tracking-wider uppercase">
              on Base Sepolia
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 pt-0">
          <div className="max-w-6xl mx-auto">
            <DepositForm />
          </div>
        </div>
        
        {/* Ethereum Believer Leaderboard Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-6xl mx-auto">
            <EthereumBelieverIndex />
          </div>
        </div>
      </main>

      <footer className="bg-secondary border-t border-paper-200 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-mono text-xs text-primary-300 font-bold tracking-wider">
              Flush or fortune - no in-between. Created on KyivETH hackaton 2025
              &lt;3
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
