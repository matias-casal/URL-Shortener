import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { redisClient } from "../config/redis";

/**
 * Rate limiter configuration using Redis
 * Restricts clients to 10 requests per second to prevent abuse
 */
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "ratelimit",
  points: 10, // Maximum number of requests
  duration: 1, // Time window in seconds
});

/**
 * Middleware that enforces rate limiting based on client IP
 * Returns 429 status when rate limit is exceeded
 */
export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await rateLimiter.consume(req.ip || "anonymous");
    next();
  } catch (error) {
    res.status(429).json({
      errors: [
        {
          status: "429",
          title: "Too Many Requests",
          detail: "You have exceeded the rate limit. Please try again later.",
        },
      ],
    });
  }
};
