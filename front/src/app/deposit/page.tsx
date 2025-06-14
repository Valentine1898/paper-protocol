import DepositForm from "@/components/DepositForm";

export default function DepositPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-secondary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-primary-700"
                >
                  <path
                    d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
                    fill="currentColor"
                  />
                  <path
                    d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h1 className="text-display text-4xl lg:text-5xl font-normal text-primary-50 tracking-wide">
                PaperProtocol
              </h1>
            </div>

            <h2 className="text-display text-2xl lg:text-3xl font-normal text-primary-100 mb-4">
              Create ETH Position
            </h2>

            <p className="text-mono text-sm lg:text-base text-primary-200 font-bold tracking-wider uppercase">
              on Base Sepolia
            </p>

            <div className="w-24 h-px bg-primary-300 mx-auto mt-8"></div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <DepositForm />
          </div>
        </div>
      </div>

      <footer className="bg-secondary border-t border-paper-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-mono text-xs text-primary-300 font-bold tracking-wider">
              Flush or fortune - no in-between.
            </p>
            <p className="text-mono text-xs text-primary-400 font-bold tracking-wider mt-1">
              Created on KyivETH hackaton 2025 &lt;3
            </p>
            <div className="mt-4">
              <div className="inline-block w-6 h-6 bg-primary-200 transform rotate-45 rounded-sm"></div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
