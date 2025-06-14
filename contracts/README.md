# Paper Protocol 🧻

## What is Paper Protocol?

Paper Protocol is a smart contract that allows you to lock assets until asset target price is reached. While assets are locked user receives dynamic NFT which changes according to your position status.

## Why do you need to lock your assets?

- **Forced HODL**: Stop yourself from selling during market dips
- **Price Targets**: Set clear goals for your investments
- **NFT Integration**: You will receive good looking💅 NFTs

## How it Works

1. **Deposit Assets**: Lock your ETH or any ERC20 token
2. **Set Price Target**: Choose when you want to be able to withdraw (e.g., "I'll withdraw when ETH hits $3000😭")
3. **Get NFT**: Receive a dynamic NFT representing your locked position
4. **Wait for Target**: Your assets stay locked until the price target is reached
5. **Withdraw**: Once the price target is hit, you can withdraw your assets

## Features

- Locking assets
- Chainlink-like PUSH oracles integration
- Dynamic NFT
- The bigger target price, the cooler NFT😎

## About dynamic NFTs

Dynamic NFTs are generated using SVG and JSON which then are converted to base64 encoded string. NFT contains such data as price at deposit, price target, amount, token symbol, tier, etc. Which higher target price your tier changes from paper to diamond💎. Those tiers also changes general look of NFT with unique styles.

## Contracts Overview

### PaperProtocol

Main contract that handles all user logic. User will interact only with `PaperProtocol.deposit()`, `PaperProtocol.withdraw()` and `ERC721` functions like `ERC721.tokenURI()` etc.

### OracleAdapter

Contract that handles all oracle logic. It is used to get price of the asset with 18 decimals. Only support PUSH oracles like Chainlink and RedStone PUSH.

### URIUtils

Contract that handles all URI logic. It is used to convert json with SVG and other metadata to URI for the NFT in base64 format.

## How to run

1. Clone the repo
2. Install dependencies: `forge install`
3. Run tests: `forge test`
4. For deployment check `script/Deploy.s.sol`

## Current Deployments

### Base Sepolia

```
Mock Token:  0xE130Ec9bB21e477E2822E940aDB1A43767A0F80a
Mock Token Oracle:  0x64A59090cB7bdA0c18cD4AD71203Cef957bA6ffE
ETH Oracle:  0xB540Cd825c455711b075073Ef7C74b86B3ab9f4b
Adapter:  0x5C793701fA61433385071961f6bF8748c98c5ca9
Protocol:  0x14C59Ba26193C65d256C41f1077c8867eB41c805
```
