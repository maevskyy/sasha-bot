import { bot } from "./modules";
import { logger } from "./common";


export async function boot() {
  try {
    logger.info("Starting bot...");
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

boot()