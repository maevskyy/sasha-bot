import { EBotScenes, IMyContext } from "../../types";
import { uiKeyboardEnter, uiTexts } from "./ui";

const enterHandler = (ctx: IMyContext) =>
  ctx.reply(uiTexts.inMenu, uiKeyboardEnter);

const onTextHandler = async (ctx: IMyContext) =>
  ctx.reply(uiTexts.dontUnderstand);

const hearsTransactionHandler = async (ctx: IMyContext) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.TRANSACTIONS);
};
const hearsSettingsHandler = async (ctx: IMyContext) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.SETTINGS);
};
const hearsStatisticHandler = async (ctx: IMyContext) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.STATISTIC);
};

export {
  enterHandler,
  hearsSettingsHandler,
  hearsStatisticHandler,
  hearsTransactionHandler,
  onTextHandler,
};
