import {
  Deposited,
  Withdrawn
} from "../generated/PaperProtocol/PaperProtocol"
import {
  EthereumBelieverIndex,
  EthPosition
} from "../generated/schema"
import { BigInt, Address, log } from "@graphprotocol/graph-ts"

// ETH token address (zero address)
const ETH_ADDRESS = Address.zero()

// Constants for decimal calculations
const DECIMALS = 18
const DECIMAL_FACTOR = BigInt.fromString("1000000000000000000") // 10^18

// Helper function to get or create the global index
function getOrCreateIndex(): EthereumBelieverIndex {
  let index = EthereumBelieverIndex.load("global")
  if (index == null) {
    index = new EthereumBelieverIndex("global")
    index.totalIndex = BigInt.fromI32(0)
    index.activePositions = 0
    index.totalEthLocked = BigInt.fromI32(0)
    index.lastUpdatedBlock = BigInt.fromI32(0)
    index.lastUpdatedTimestamp = BigInt.fromI32(0)
    index.save()
  }
  return index
}

export function handleDeposited(event: Deposited): void {
  let tokenId = event.params.tokenId
  let tokenAddress = event.params.token
  let amount = event.params.amount
  let targetPrice = event.params.priceTarget
  
  // Only track ETH deposits
  if (!tokenAddress.equals(ETH_ADDRESS)) {
    return
  }
  
  // Calculate position value with proper decimal handling
  // positionValue = (amount * targetPrice) / 10^18
  let positionValue = amount.times(targetPrice).div(DECIMAL_FACTOR)
  
  // Create position entity
  let position = new EthPosition(tokenId.toString())
  position.depositor = event.transaction.from
  position.amount = amount
  position.targetPrice = targetPrice
  position.positionValue = positionValue
  position.isActive = true
  position.createdBlock = event.block.number
  position.createdTimestamp = event.block.timestamp
  position.transactionHash = event.transaction.hash
  position.save()
  
  // Update global index
  let index = getOrCreateIndex()
  index.totalIndex = index.totalIndex.plus(positionValue)
  index.activePositions = index.activePositions + 1
  index.totalEthLocked = index.totalEthLocked.plus(amount)
  index.lastUpdatedBlock = event.block.number
  index.lastUpdatedTimestamp = event.block.timestamp
  index.save()
  
  log.info("ETH deposited: tokenId={}, amount={}, targetPrice={}, positionValue={}", [
    tokenId.toString(),
    amount.toString(),
    targetPrice.toString(),
    positionValue.toString()
  ])
}

export function handleWithdrawn(event: Withdrawn): void {
  let tokenId = event.params.tokenId
  let tokenAddress = event.params.token
  let amount = event.params.amount
  
  // Only track ETH withdrawals
  if (!tokenAddress.equals(ETH_ADDRESS)) {
    return
  }
  
  // Load position
  let position = EthPosition.load(tokenId.toString())
  if (position == null) {
    log.warning("Position not found for withdrawal: tokenId={}", [tokenId.toString()])
    return
  }
  
  // Mark position as inactive
  position.isActive = false
  position.save()
  
  // Update global index
  let index = getOrCreateIndex()
  index.totalIndex = index.totalIndex.minus(position.positionValue)
  index.activePositions = index.activePositions - 1
  index.totalEthLocked = index.totalEthLocked.minus(amount)
  index.lastUpdatedBlock = event.block.number
  index.lastUpdatedTimestamp = event.block.timestamp
  index.save()
  
  log.info("ETH withdrawn: tokenId={}, amount={}, positionValue={}", [
    tokenId.toString(),
    amount.toString(),
    position.positionValue.toString()
  ])
} 