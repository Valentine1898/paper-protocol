"use client";

import Link from "next/link";
import Image from "next/image";
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
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Paper Protocol"
                width={48}
                height={48}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </div>
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
