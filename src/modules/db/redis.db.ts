import Redis from "ioredis";
import { internalConfig, logger } from "../../common";

const { host, port, password } = internalConfig.db.redis;

const redisClient = new Redis({
  host,
  port,
  password,
});

// const session = new RedisSession({
//   store: {
//     client: redisClient,
//   },
//   // ttl: 86400,  24 hours
//   ttl: 864
// });

redisClient.on("error", (err) => {
  logger.error("Redis error", err);
  throw new Error("Redis erro");
});

const isSessionValid = async (chatId: number) => {
  try {
    const session = await redisClient.get(`session:${chatId}`);
    return !!session;
  } catch (error) {
    logger.error(`Failed isSessionValid: ${chatId}`);
    throw new Error("Failed isSessionValid");
  }
};

const setSession = async (chatId: number) => {
  try {
    await redisClient.set(`session:${chatId}`, "true", "EX", 3600);
    logger.info(`Session set for chatId: ${chatId}`);
  } catch (error) {
    logger.error(`Failed setSession: ${chatId}`);
    throw new Error("Failed setSession");
  }
};

export { isSessionValid, redisClient, setSession };
