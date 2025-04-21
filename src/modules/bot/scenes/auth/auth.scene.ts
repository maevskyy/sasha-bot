import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { message } from "telegraf/filters";
import { getUserByChatId, setSession } from "../../../db";

const authScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.AUTH,
  new Composer<IMyContext>()
);
authScene.enter((ctx) => ctx.reply("Введіь пароль:"));
authScene.on(message("text"), async (ctx) => {
  const chatId = ctx.chat.id;
  const message = ctx.message.text;
  const getUser = await getUserByChatId(chatId);
  if (!getUser) return ctx.reply("Доступ заблокований");
  await setSession(chatId);
  if (message !== getUser.password) return ctx.reply("Не вірний пароль");
  return ctx.scene.enter(EBotScenes.MENU);
});

export { authScene };
