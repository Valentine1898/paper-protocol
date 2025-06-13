import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import WalletConnect from "@/components/WalletConnect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paper Protocol - Web3 Platform",
  description: "Decentralized platform with secure wallet connection powered by Privy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900">Paper Protocol</h1>
              </div>
              <WalletConnect />
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
