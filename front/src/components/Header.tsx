"use client";

import Link from "next/link";
import WalletConnect from "./WalletConnect";

interface HeaderProps {
  showWalletConnect?: boolean;
}

export default function Header({ showWalletConnect = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-secondary px-4 py-3">
      <div
        className={`container mx-auto flex items-center ${
          showWalletConnect ? "justify-between" : "justify-center"
        }`}
      >
        <div className="flex items-center">
          <Link href="/" className="cursor-pointer">
            <img
              src="/logo.svg"
              alt="Paper Protocol"
              className="h-24 hover:opacity-80 transition-opacity duration-200"
            />
          </Link>
        </div>

        {showWalletConnect && (
          <div className="flex items-center">
            <WalletConnect />
          </div>
        )}
      </div>
    </header>
  );
}
