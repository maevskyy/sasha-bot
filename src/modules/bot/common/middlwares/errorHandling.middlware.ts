import { IMyContext, TNextFunction } from "../../types";
import { logger } from "../../../../common";

export const errorHandler = async (ctx: IMyContext, next: TNextFunction) => {
  try {
    await next();
  } catch (error) {
    logger.error(`Error occurred in update ${ctx.update.update_id}: ${error}`);

    const errorMessage =
      "Error occurred. Please, restart bot with /start.";
    if (ctx.chat) {
      await ctx.reply(errorMessage);
    }
  }
};
