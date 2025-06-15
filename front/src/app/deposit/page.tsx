"use client";

import { useState } from "react";
import DepositForm from "@/components/DepositForm";
import WithdrawForm from "@/components/WithdrawForm";
import Header from "@/components/Header";
import EthereumBelieverIndex from "@/components/EthereumBelieverIndex";
import { useETHPrice } from "@/hooks/useETHPrice";

export default function DepositPage() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const {
    price: ethPrice,
    loading: ethPriceLoading,
    error: ethPriceError,
  } = useETHPrice();

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header showWalletConnect={true} />

      <main className="flex-1  ">
        <div className="container mx-auto px-4 pt-12 pb-8 relative z-1000">
          <div className="text-center mb-4">
            <h2 className="text-display text-5xl font-normal text-primary-900 mb-4">
              {activeTab === "deposit"
                ? "Create ETH Position"
                : "Manage Positions"}
            </h2>

            <div className="flex items-center justify-center font-mono font-bold">
              {" "}
              {/* ETH Price Display */}
              <div className="flex items-center justify-center space-x-2 text-md pr-3">
                <div
                  className={`w-2 h-2 ${
                    ethPriceLoading
                      ? "bg-yellow-500"
                      : ethPriceError
                      ? "bg-red-500"
                      : "bg-green-500"
                  } animate-pulse`}
                ></div>
                <span className=" text-primary-900">
                  1 ETH{" "}
                  <span className="text-primary-900/40">
                    ≈ $
                    {ethPriceLoading
                      ? "..."
                      : ethPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </span>
                </span>
              </div>
              <p className="text-mono text-sm lg:text-base text-primary-900/40 font-bold ">
                on Base Sepolia
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 pt-0">
          <div className="max-w-6xl mx-auto">
            {/* Tab switcher - aligned with form column */}
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 mb-8 relative z-1000">
              <div className="col-start-2 col-span-1 ">
                <div className="flex ">
                  <div className="bg-primary-900/10 p-1 inline-flex w-full">
                    <button
                      onClick={() => setActiveTab("deposit")}
                      className={`px-8 py-3 font-mono font-bold text-lg transition-all w-full ${
                        activeTab === "deposit"
                          ? "bg-primary-800 text-secondary"
                          : "text-primary-900 hover:text-primary-800"
                      }`}
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => setActiveTab("withdraw")}
                      className={`px-8 py-3 font-mono font-bold text-lg transition-all w-full ${
                        activeTab === "withdraw"
                          ? "bg-primary-800 text-secondary"
                          : "text-primary-900 hover:text-primary-800"
                      }`}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
              {/* Empty space for NFT column alignment */}
              <div></div>
            </div>

            {/* Form content */}
            {activeTab === "deposit" ? <DepositForm /> : <WithdrawForm />}
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
