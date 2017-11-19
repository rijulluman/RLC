// Author : Rijul Luman
module.exports = Object.freeze({

  "SOCKET_BROADCAST_BLOCK"        : "blockBroadcast",
  "SOCKET_BROADCAST_TRANSACTION"  : "transactionBroadcast",
  "SOCKET_GET_LATEST_BLOCK_HASHES": "latestBlockHashes",
  "SOCKET_GET_LATEST_BLOCK_REPLY" : "latestBlockHashesReply",
  "FORK"                          : "fork",
  "MY_HASHES"                     : "myHashes",
  "MAX_OVERWRITE_BLOCKS"          : 100,

  "PRIVATE_KEY_LENGTH"            : 32,
  "VALID_HEX_PRIVATE_KEY_LENGTH"  : 64,      // this.PRIVATE_KEY_LENGTH * 2,
  "VALID_HEX_PUBLIC_KEY_LENGTH"   : 66,
  "SUM_DECIMAL_CORRECTION"        : 10000000,
  "MINIMUM_TRANSACTION_NONCE"     : 1000000,
  "BLOCK_MAX_TRANSACTIONS_COUNT"  : 512,
  "GENESIS_BLOCK_PREV_HASH"       : "0123456789abcdeffedcba98765432100123456789abcdeffedcba9876543210",
  "GENESIS_BLOCK_TARGET"          : "03ffffff",   // 03ffffff is approximately 1 min
  "DIFFICULTY_CHANGE_EVERY_BLOCKS": 10,
  "TRANSACTION_DEADLINE_OFFSET"   : 100,     // Number of blocks before expiring
  "MAX_STAKEABLE_BLOCKS"          : 100,
  "MIN_HOLD_FOR_STAKE_BLOCKS"     : 20,

  "AVERAGE_BLOCK_TIME_MS"         : 6000,     // 60000 * 1,     // 1 min
  "CURRENT_BLOCK_REDIS_TTL"       : 200,      // Idealy a little higer than the average block time
  "BLOCK_COIN_AGE_REDIS_TTL"      : 200,      // Idealy a little higer than the average block time
  "UNCONFIRMED_TRANSACTION_TTL_SECONDS_PER_BLOCK" : 3600,  // Seconds per block difference
  "UPDATE_REQUEST_BLOCK_HASH_COUNT" : 10,

  "redisPath" : {
    "unconfirmedTransaction"        : "UT.",
    "sortedUnconfirmedTransaction"  : "SUT",
    "currentBlock"                  : "CB",
    "coinAge"                       : "AGE."
  }

});
