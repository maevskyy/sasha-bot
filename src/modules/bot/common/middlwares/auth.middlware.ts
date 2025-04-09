import { isSessionValid } from "../../../db";
import { EBotScenes, IMyContext, TNextFunction } from "../../types";

export const isAuth = async (ctx: IMyContext, next: TNextFunction) => {
  const chatId = ctx.chat?.id;
  if (!chatId) return next();
  const isAuth = await isSessionValid(chatId);
  if (!isAuth) {
    await ctx.reply("Введіть пароль, сессія expired:");
    await ctx.scene.enter(EBotScenes.AUTH); 
    return; 
  }
  return next();
};
