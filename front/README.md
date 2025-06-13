# Paper Protocol - Web3 Frontend

This is a Next.js web3 frontend application with wallet connection functionality powered by Privy.

## Features

- 🔐 Secure wallet connection using Privy
- 📱 Support for multiple wallet types (MetaMask, WalletConnect, etc.)
- 📧 Email-based authentication option
- 🌐 Multi-chain support (Ethereum, Polygon, and testnets)
- 🎨 Beautiful, responsive UI with Tailwind CSS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

### 3. Get Privy App ID

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Create a new application or use an existing one
3. Copy your App ID from the dashboard
4. Replace `your-privy-app-id` in `.env.local` with your actual App ID

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page with wallet connection
│   ├── providers.tsx       # Privy and Wagmi providers setup
│   └── globals.css         # Global styles
└── components/
    └── WalletConnect.tsx   # Wallet connection component
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Privy** - Wallet authentication and management
- **Wagmi** - Ethereum interactions
- **Viem** - TypeScript interface for Ethereum

## Supported Networks

- Ethereum Mainnet
- Ethereum Sepolia (Testnet)
- Polygon
- Polygon Mumbai (Testnet)

## Next Steps

This foundation provides:
- Wallet connection functionality
- User authentication state management
- Multi-chain support setup
- Clean, extensible architecture

You can now build additional features like:
- Smart contract interactions
- Token transfers
- NFT operations
- DeFi integrations

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
