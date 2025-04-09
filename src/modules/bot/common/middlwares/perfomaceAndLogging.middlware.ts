import { IMyContext, TNextFunction } from "../../types";
import { logger } from "../../../../common";

export const loggingAndProcessingTime = async (
  ctx: IMyContext,
  next: TNextFunction
) => {
  const startTime = performance.now();
  await next();
  const endTime = performance.now();
  const time = (endTime - startTime) / 1000;
  logger.info(
    `Action: ${JSON.stringify(ctx.update, null, 2)}\nPerfomace: ${time.toFixed(
      3
    )}s`
  );
};
