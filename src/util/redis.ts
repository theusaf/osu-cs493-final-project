import redis from "redis";
import { sleep } from "./sleep.js";

const host = process.env.REDIS_HOST;
const port = +(process.env.REDIS_PORT ?? "6379");

const redisClient = redis.createClient({
  url: `redis://${host}:${port}`,
});

while (true) {
  console.info("Connecting to Redis...");
  try {
    await redisClient.connect();
    console.info("Connected to Redis");
    break;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    await sleep(1000);
    continue;
  }
}

export default redisClient;
