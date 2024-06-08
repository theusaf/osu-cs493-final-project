import { NextFunction, Response } from "express";
import { PartiallyAuthenticatedRequest } from "./authentication.js";
import redisClient from "./redis.js";

const rateLimitWindow = +(process.env.RATE_LIMIT_WINDOW ?? "60000");
const rateLimitWindowMax = +(process.env.RATE_LIMIT_WINDOW_MAX ?? "10");

export async function ratelimit(
  req: PartiallyAuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.userId) {
    return next();
  }
  const ip = req.ip!;

  try {
    const redisTokenBucket = await redisClient.hGetAll(ip);
    const tokenBucket = {
      tokens: +redisTokenBucket.tokens || rateLimitWindowMax,
      last: +redisTokenBucket.last || Date.now(),
    };

    const now = Date.now();
    const elapsed = now - tokenBucket.last;
    const refreshRate = rateLimitWindowMax / rateLimitWindow;

    tokenBucket.tokens += elapsed * refreshRate;
    tokenBucket.tokens = Math.min(rateLimitWindowMax, tokenBucket.tokens);
    tokenBucket.last = now;

    if (tokenBucket.tokens >= 1) {
      tokenBucket.tokens -= 1;
      await redisClient.hSet(ip, [
        ["tokens", tokenBucket.tokens],
        ["last", tokenBucket.last],
      ]);
      next();
    } else {
      res.status(429).json({ error: "Rate limit exceeded" });
    }
  } catch (error) {
    console.error("Failed to get token bucket:", error);
    return next();
  }
}
