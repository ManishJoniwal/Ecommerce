// const { createClient } = require("redis");

// async function getRedisClient() {
//   const client = await createClient()
//     .on("error", (err) => console.log("Redis Client Error", err))
//     .connect();
//     return client
// }

// module.exports = getRedisClient

const Redis = require("ioredis");

// Redis connection configuration
// const redisConfig = {
//   host: process.env.REDIS_HOST || "127.0.0.1",
//   port: process.env.REDIS_PORT || 6379,
//   password: process.env.REDIS_PASSWORD || undefined,
//   maxRetriesPerRequest: 3,
//   retryDelayOnFailover: 100,
//   lazyConnect: true,
//   keepAlive: 30000,
//   connectTimeout: 10000,
//   db: 1, // Use a different database for caching
// };

// Create Redis connection for caching
const redisClient = new Redis();

// Test Redis connection
redisClient.on("connect", () => {
  console.log("✅ Redis Cache connected successfully");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Cache connection error:", err.message);
});

/**
 * Redis Cache Utility Functions
 */
class RedisCache {
  /**
   * Generate cache key
   * @param {string} prefix - Cache key prefix
   * @param {object} params - Parameters to include in key
   * @returns {string} Generated cache key
   */
  static generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join("|");

    return sortedParams ? `${prefix}:${sortedParams}` : prefix;
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {object|null} Cached data or null
   */
  static async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null; // Return null on error to fallback to database
    }
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {object} data - Data to cache
   * @param {number} ttl - Time to live in seconds (default: 5 minutes)
   */
  static async set(key, data, ttl = 300) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Redis set error:", error);
      // Don't throw error - caching is optional
    }
  }

  /**
   * Delete data from cache
   * @param {string} key - Cache key
   */
  static async del(key) {
    try {
      const keys = await redisClient.keys(key)
      await redisClient.del(keys);
    } catch (error) {
      console.error("Redis delete error:", error);
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., "providers:*")
   */
  static async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error("Redis delete pattern error:", error);
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  static async getStats() {
    try {
      const info = await redisClient.info("memory");
      const keyspace = await redisClient.info("keyspace");

      return {
        memory: info,
        keyspace: keyspace,
        connection_status: redisClient.status,
      };
    } catch (error) {
      console.error("Redis stats error:", error);
      return { error: error.message };
    }
  }

  /**
   * Clear all cache
   */
  static async flushAll() {
    try {
      await redisClient.flushall();
      console.log("✅ Redis cache cleared");
    } catch (error) {
      console.error("Redis flush error:", error);
    }
  }
}

module.exports = {
  RedisCache
};
