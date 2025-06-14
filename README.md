# Paper Protocol 🧻

## Paper What?🙄

Paper Protocol is a project that makes your hold unstoppable. If you committed, if you are a believer there is no step back. Either hold to your goal or go with nothing. And you know what? Paper Protocol with help you HODL to the end. Our main purpose is to hold your ETH until the target price is reached. If the target price is not reached you will still hold. If the current price is going lower and lower you will still hold. If your ETH price becomes 0... well... the only thing you will have is belief, your dead HODL and AMAZING NFT that would remind you every day that you are a HODLer.

## Too much? Ok, let's go slower

The core of the protocol is smart contracts. The main smart contract allows you to lock assets until the asset target price is reached. In return, you will receive a dynamic generated NFT that represents your lock and how cool you are.

### How cool am I?

Your coolness depends on how strong your belief is. The more you believe the better grade NFT you get. There are a few NFT tiers that correspond to your position's target price (the bigger the coller😎). Here are all tier grades:

- 🧻 Paper Hands Tier - if your ETH target price is less than 5000$ then you are a believer but not very big. One day you believe ETH will be 4000$ but after one Trump tweet you want to sell it, so to not sell it you lock it.
- 💪 Smart Hands Tier - if the target price is less than 7000$ then you are a smart person. You believe ETH will have a very good near future but sometimes you are still tempted to sell it. Smart move for a smart person to HODL.
- 🦾 Strong Hands Tier - if the target price is less than 10000$ then you are strong - you have strong arms to press DEPOSIT and a strong belief that ETH will perform greatly.
- 💪 Diamond Hands Tier - for target price bigger than 10000$. Let's say that you are either Vitalik, Rostik, ultra super mega strong believer or some unimaginable psycho that would lock money for half a century. I mean if it works it works🤷‍♂️... If Paper Protocol allows you to not worry about "accidental" ETH sell then we did a great job of building it.

### So when Im allowed to get my precious ETH back?

When ETH reaches the target price you can withdraw your assets. As a memory, you will only have your NFT with your (ETH) old goals (target price).

## About Art

All NFTs are pieces of art, each one is true DeFi stuff and stored fully on the chain. SVG is generated using user deposit data which also determines its tier and all that converts into good-looking NFT with all necessary metadata.

## How to interact with protocol?

To interact with Paper Protocol you need to use [web app](https://paper-protocol.vercel.app/), click "Start Depositing", connect your wallet, set the target price for ETH (or select from available targets), set the ETH amount you want to lock and click "Create Position". Good job, now every day you will pray to Blockchain gods so they boost the ETH price so you can unite with your priceless virtual currency again. Also while you are filling deposit form you can see at the same time the amazing NFT you will get for your deposit.

## One more thing and The Graph

Of course, that's not all. You are not alone in this journey of edging SELL button with the inability to click it because your funds are locked. There are other people that lock their ETH so they hold it with guarantee. So especially for all of you, there is [leaderboard](https://paper-protocol.vercel.app/believer-index) that shows how degen you are. This table shows the rating of wallets, how much ETH they locked, their position in rating and **Believer Index**.

The Graph powers this Believer Index. Instead of just tracking who deposited what, it calculates your conviction score by multiplying your ETH amount by your target price (`amount * target_price`). Lock 1 ETH at $10k target? You're more of a believer than someone who locks 2 ETH at $4k target. You locked 100 ETH at $20k target? Wow, for such actions to ETH community 1st place among all HODLers is yours.

## Summarization

- Paper Protocol is a project that makes your HOLD as true as it can be.
- You will receive a dynamic-generated NFT that represents your lock and how cool you are.
- There are a few NFT tiers that correspond to your position's target price (the bigger the better).
- When ETH reaches the target price you can withdraw your assets. And as a memory, you will only have your NFT.
- All NFTs are a piece of art, each one is true DeFi stuff and stored fully on the chain.
- Each HODL - is one more step to better Ethereum

## Contracts Overview

### PaperProtocol

The main contract that handles all user logic. User will interact only with `PaperProtocol.deposit()`, `PaperProtocol.withdraw()` and `ERC721` functions like `ERC721.tokenURI()` etc. If you want to pass your locked position you can just transfer it using `ERC721.transferFrom()` and the new owner of NFT becomes the owner of your locked position. `tokenURI()` and `contractURI()` returns base64 encoded JSON string with metadata compatible with OpenSea which also includes dynamically generated SVG image. In general, it supports not only ETH but any ERC20 token price which we know from our `OracleAdapter`.

### OracleAdapter

A contract that handles all Oracle logic. It is used to get the price of the asset with 18 decimals. Only support PUSH oracles like Chainlink and RedStone PUSH.

### URIUtils

Helper contract that handles all metadata and base64 encoding logic. Intermediate contract between data and SVG.

### PaperWrapper

A contract that handles inserting tier SVG into the main SVG wrapper that contains position data.

### PaperTiers and tiers

Because the contracts size limit for EVM chains is 24KB we can not pull all tiers svgs into one contract. Because of that for each tier, there is a separate contract that contains only SVG for its tier. The contract that unites all tier SVGs is `PaperTiers` contract which contains mapping linking all tier SVGs and retrieves tier data according to position ETH target price

## Smart contract Deployments

Contracts are deployed on Base Sepolia testnet.

```
OracleAdapter:  0xb580Bbc11d8Af009D1235E4601CB3B500B2E7da1
Protocol:  0x32730feaBb33d0C430d37a5141AC7f98086Ac643
Mock ETH Oracle:  0x207028099EF549f588Fa578519FD4bC087B95E32
```
