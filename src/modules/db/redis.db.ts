import Redis from "ioredis";
import { internalConfig, logger } from "../../common";

const { host, port, password } = internalConfig.db.redis;

const redisClient = new Redis({
  host,
  port,
  password,
});

redisClient.on("error", (err) => {
  logger.error("Redis error", err);
  throw new Error("Redis erro");
});

const redisPing = async (): Promise<boolean> => {
  try {
    const response = await redisClient.ping();
    if (response === "PONG") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.error("Redis ping failed:", error);
    return false;
  }
};

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

export { isSessionValid, redisClient, setSession, redisPing };
