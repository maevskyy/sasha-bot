import { bot } from "./modules";
import { logger } from "./common";
import { supabasePing, redisPing } from "./modules/db";

export async function boot() {
  try {
    logger.info("Pinging Supabase...");

    const supabaseHealthy = await supabasePing();
    if (!supabaseHealthy) {
      logger.error("Supabase ping failed. Aborting launch.");
      process.exit(1);
    }

    logger.info("Pinging Redis...");
    const redisHealthy = await redisPing();
    if (!redisHealthy) {
      logger.error("Redis ping failed. Aborting launch.");
      process.exit(1);
    }

    logger.info("All services healthy. Starting bot...");
    await bot.launch();
    logger.info("Bot is running...");

    process.once("SIGINT", () => {
      logger.info("SIGINT received. Stopping bot...");
      bot.stop("SIGINT");
      process.exit(0);
    });

    process.once("SIGTERM", () => {
      logger.info("SIGTERM received. Stopping bot...");
      bot.stop("SIGTERM");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Error during application boot:", error);
    process.exit(1);
  }
}

boot();
