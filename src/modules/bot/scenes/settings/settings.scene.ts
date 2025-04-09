import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { getCardsByUserId } from "../../../db";
import { formatCards } from "../../common/helpers";
import { createKeyboard } from "../../common/keyboards";
import { message } from "telegraf/filters";

const settingComposer = new Composer<IMyContext>();
settingComposer.hears("Додати картку ➕", async (ctx) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.ADDCARD);
});
settingComposer.hears("Видалити картку 🗑", async (ctx) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.DELETECARD);
});
settingComposer.hears("Редагувати картку ✏", async (ctx) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.EDITCARD);
});
settingComposer.hears("В меню ⬅", async (ctx) => {
  await ctx.scene.leave();
  ctx.scene.enter(EBotScenes.MENU);
});
settingComposer.on(message("text"), async (ctx) => {
  return ctx.reply("Не розумію");
});

// ============ REGISTER_SCENE ============
const settingsScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.SETTINGS,
  settingComposer
);

settingsScene.enter(async (ctx) => {
  let text: string = "У вас пока немає доданих карт";
  const cards = await getCardsByUserId(ctx.chat?.id ?? 0);
  if (cards) text = formatCards(cards);
  const myKeyboard = createKeyboard([
    ["Додати картку ➕", "Редагувати картку ✏"],
    ["Видалити картку 🗑", "В меню ⬅"],
  ]);
  ctx.reply(text, myKeyboard);
});

export { settingsScene };
