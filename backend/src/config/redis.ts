import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

/**
 * Redis connection URL, defaults to local Redis instance in Docker
 */
const redisUrl = process.env.REDIS_URL || "redis://redis:6379";

/**
 * Redis client instance used throughout the application
 */
export const redisClient = createClient({
  url: redisUrl,
});

/**
 * Redis error handling
 */
redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

/**
 * Connects to Redis server
 * Called during application initialization
 */
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection error:", error);
  }
};
