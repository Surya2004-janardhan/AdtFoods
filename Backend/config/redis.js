const redis = require("redis");
const dotenv = require("dotenv");

dotenv.config();

let redisClient = null;
let isRedisConnected = false;

const connectRedis = async () => {
  // Redis must be configured to connect
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    console.log("⚠️  Redis not configured - running without cache");
    return null;
  }

  try {
    const redisConfig = process.env.REDIS_URL
      ? { url: process.env.REDIS_URL }
      : {
          socket: {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379"),
          },
          password: process.env.REDIS_PASSWORD || undefined,
        };

    redisClient = redis.createClient(redisConfig);

    redisClient.on("error", (err) => {
      console.error("❌ Redis Client Error:", err);
      isRedisConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("🔄 Redis connecting...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis connected successfully");
      isRedisConnected = true;
    });

    redisClient.on("end", () => {
      console.log("⚠️  Redis connection closed");
      isRedisConnected = false;
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error.message);
    console.log("⚠️  Continuing without Redis cache");
    isRedisConnected = false;
    return null;
  }
};

const getRedisClient = () => {
  return isRedisConnected ? redisClient : null;
};

const isRedisAvailable = () => {
  return isRedisConnected && redisClient !== null;
};

// Cache helper functions
const setCache = async (key, value, expirationInSeconds = 300) => {
  if (!isRedisAvailable()) return false;

  try {
    const serializedValue = JSON.stringify(value);
    await redisClient.setEx(key, expirationInSeconds, serializedValue);
    return true;
  } catch (error) {
    console.error("Redis SET error:", error.message);
    return false;
  }
};

const getCache = async (key) => {
  if (!isRedisAvailable()) return null;

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis GET error:", error.message);
    return null;
  }
};

const deleteCache = async (key) => {
  if (!isRedisAvailable()) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Redis DELETE error:", error.message);
    return false;
  }
};

const deleteCachePattern = async (pattern) => {
  if (!isRedisAvailable()) return false;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error("Redis DELETE PATTERN error:", error.message);
    return false;
  }
};

const clearAllCache = async () => {
  if (!isRedisAvailable()) return false;

  try {
    await redisClient.flushAll();
    return true;
  } catch (error) {
    console.error("Redis FLUSH error:", error.message);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisAvailable,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  clearAllCache,
};
