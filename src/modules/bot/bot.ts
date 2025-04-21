import { Scenes, Telegraf, session } from "telegraf";
import { internalConfig } from "../../common";
import { errorHandler, loggingAndProcessingTime } from "./common/middlwares";
import { EBotScenes, IMyContext } from "./types";
import { scenes } from "./scenes";
import { isSessionValid } from "../db";
import { message } from "telegraf/filters";

const bot = new Telegraf<IMyContext>(internalConfig.bot_token);
const botScenes = new Scenes.Stage<IMyContext>(scenes);

bot.command("restart", async (ctx) => {
  return ctx.reply("Do a restart command");
});

// ============ MIDDLEWARES ============

botScenes.use(errorHandler, loggingAndProcessingTime)

bot.use(
  session(),
  botScenes.middleware(),
  errorHandler,
  loggingAndProcessingTime
);

// ============ HANDLERS ============
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const isAuth = await isSessionValid(chatId);
  if (!isAuth) {
    return ctx.scene.enter(EBotScenes.AUTH);
  } else {
    return ctx.scene.enter(EBotScenes.MENU);
  }
});

bot.on(message("text"), async (ctx) => {
  const chatId = ctx.chat.id;
  const isAuth = await isSessionValid(chatId);
  if (isAuth) {
    return ctx.scene.enter(EBotScenes.MENU);
  }
  if(!isAuth) {
    return ctx.scene.enter(EBotScenes.AUTH);
  }
});

export { bot };
