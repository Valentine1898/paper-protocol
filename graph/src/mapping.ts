import {
  Deposited,
  Transfer,
  OwnershipTransferred
} from "../generated/PaperProtocol/PaperProtocol"
import {
  User,
  Lock,
  Token,
  ProtocolStats,
  DailyStats,
  UserActivity
} from "../generated/schema"
import { BigInt, BigDecimal, Address, Bytes, log } from "@graphprotocol/graph-ts"

// Helper function to get or create protocol stats
function getOrCreateProtocolStats(): ProtocolStats {
  let stats = ProtocolStats.load("protocol");
  if (stats == null) {
    stats = new ProtocolStats("protocol");
    stats.totalValueLocked = BigInt.fromI32(0);
    stats.totalUsers = 0;
    stats.totalLocks = 0;
    stats.activeLocks = 0;
    stats.totalNFTsMinted = 0;
    stats.totalSuccessfulPredictions = 0;
    stats.totalFailedPredictions = 0;
    stats.overallSuccessRate = BigDecimal.fromString("0");
    stats.supportedTokensCount = 0;
    stats.lastUpdatedAt = BigInt.fromI32(0);
    stats.allTimeHighTVL = BigInt.fromI32(0);
    stats.partnersCount = 0;
    stats.save();
  }
  return stats;
}

// Helper function to get or create user
function getOrCreateUser(userAddress: Address): User {
  let user = User.load(userAddress);
  if (user == null) {
    user = new User(userAddress);
    user.totalValueLocked = BigInt.fromI32(0);
    user.successfulPredictions = 0;
    user.failedPredictions = 0;
    user.successRate = BigDecimal.fromString("0");
    user.highestNFTRank = 0;
    user.totalLocks = 0;
    user.activeLocks = 0;
    user.firstSeenAt = BigInt.fromI32(0);
    user.lastSeenAt = BigInt.fromI32(0);
    user.rank = 0;
    user.save();

    // Update protocol stats
    let stats = getOrCreateProtocolStats();
    stats.totalUsers = stats.totalUsers + 1;
    stats.save();
  }
  return user;
}

// Helper function to get or create token
function getOrCreateToken(tokenAddress: Address): Token {
  let token = Token.load(tokenAddress);
  if (token == null) {
    token = new Token(tokenAddress);
    
    // Try to get token info, but use defaults if calls fail
    token.symbol = "UNKNOWN";
    token.name = "Unknown Token";
    token.decimals = 18;
    
    token.totalValueLocked = BigInt.fromI32(0);
    token.activeLocks = 0;
    token.successfulPredictions = 0;
    token.failedPredictions = 0;
    token.currentPrice = BigInt.fromI32(0);
    token.priceUpdatedAt = BigInt.fromI32(0);
    token.allTimeHigh = BigInt.fromI32(0);
    token.allTimeLow = BigInt.fromI32(0);
    token.firstSeenAt = BigInt.fromI32(0);
    token.save();
  }
  return token;
}

// Helper function to get daily stats
function getOrCreateDailyStats(timestamp: BigInt): DailyStats {
  let dayTimestamp = timestamp.div(BigInt.fromI32(86400)).times(BigInt.fromI32(86400));
  let dayId = dayTimestamp.toString();
  
  let stats = DailyStats.load(dayId);
  if (stats == null) {
    stats = new DailyStats(dayId);
    stats.date = dayTimestamp;
    stats.totalValueLocked = BigInt.fromI32(0);
    stats.newUsers = 0;
    stats.newLocks = 0;
    stats.unlocks = 0;
    stats.nftsMinted = 0;
    stats.dailyVolume = BigInt.fromI32(0);
    stats.activeUsers = 0;
    stats.successRate = BigDecimal.fromString("0");
    stats.save();
  }
  return stats;
}

export function handleDeposited(event: Deposited): void {
  let tokenId = event.params.tokenId;
  let tokenAddress = event.params.token;
  let amount = event.params.amount;
  let priceTarget = event.params.priceTarget;
  
  // Get user from the transaction sender
  let userAddress = event.transaction.from;
  let user = getOrCreateUser(userAddress);
  let token = getOrCreateToken(tokenAddress);
  
  // Create lock entity
  let lockId = event.transaction.hash.concatI32(event.logIndex.toI32());
  let lock = new Lock(lockId);
  lock.user = user.id;
  lock.token = token.id;
  lock.amount = amount;
  lock.targetPrice = priceTarget;
  lock.lockPrice = BigInt.fromI32(0); // We don't have current price in this event
  lock.lockedAt = event.block.timestamp;
  lock.lockBlock = event.block.number;
  lock.isActive = true;
  lock.unlockedAt = null;
  lock.targetReached = false; // Default to false instead of null
  lock.unlockPrice = null;
  lock.nft = null;
  lock.duration = null;
  lock.transactionHash = event.transaction.hash;
  lock.save();

  // Update user stats
  user.totalValueLocked = user.totalValueLocked.plus(amount);
  user.totalLocks = user.totalLocks + 1;
  user.activeLocks = user.activeLocks + 1;
  user.lastSeenAt = event.block.timestamp;
  
  if (user.firstSeenAt.equals(BigInt.fromI32(0))) {
    user.firstSeenAt = event.block.timestamp;
  }
  user.save();

  // Update token stats
  token.totalValueLocked = token.totalValueLocked.plus(amount);
  token.activeLocks = token.activeLocks + 1;
  if (token.firstSeenAt.equals(BigInt.fromI32(0))) {
    token.firstSeenAt = event.block.timestamp;
  }
  token.save();

  // Update protocol stats
  let protocolStats = getOrCreateProtocolStats();
  protocolStats.totalValueLocked = protocolStats.totalValueLocked.plus(amount);
  protocolStats.totalLocks = protocolStats.totalLocks + 1;
  protocolStats.activeLocks = protocolStats.activeLocks + 1;
  protocolStats.lastUpdatedAt = event.block.timestamp;
  
  if (protocolStats.totalValueLocked.gt(protocolStats.allTimeHighTVL)) {
    protocolStats.allTimeHighTVL = protocolStats.totalValueLocked;
  }
  protocolStats.save();

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  dailyStats.newLocks = dailyStats.newLocks + 1;
  dailyStats.dailyVolume = dailyStats.dailyVolume.plus(amount);
  dailyStats.totalValueLocked = protocolStats.totalValueLocked;
  dailyStats.save();

  // Create user activity
  let activityId = userAddress.toHexString()
    .concat("-")
    .concat(event.block.timestamp.toString())
    .concat("-LOCK_CREATED");
  let activity = new UserActivity(Bytes.fromUTF8(activityId));
  activity.user = user.id;
  activity.activityType = "LOCK_CREATED";
  activity.lock = lock.id;
  activity.nft = null;
  activity.timestamp = event.block.timestamp;
  activity.transactionHash = event.transaction.hash;
  activity.metadata = null;
  activity.save();
}

export function handleTransfer(event: Transfer): void {
  let tokenId = event.params.tokenId;
  let from = event.params.from;
  let to = event.params.to;
  
  // Skip minting events (from = 0x0)
  if (from.equals(Address.zero())) {
    return;
  }
  
  // For now, just log the transfer
  log.info("NFT Transfer: tokenId {} from {} to {}", [
    tokenId.toString(),
    from.toHexString(),
    to.toHexString()
  ]);
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  log.info("Ownership transferred from {} to {}", [
    event.params.previousOwner.toHexString(),
    event.params.newOwner.toHexString()
  ]);
} 