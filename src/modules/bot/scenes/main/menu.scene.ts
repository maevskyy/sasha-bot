import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { message } from "telegraf/filters";
import { createKeyboard } from "../../common/keyboards";

const main = new Composer<IMyContext>();
main.hears("Статистика 📊", async (ctx) => {
    await ctx.scene.leave();
    return ctx.scene.enter(EBotScenes.STATISTIC);
});
main.hears('Налаштування ⚙',async  (ctx) => {
  await ctx.scene.leave()
  return ctx.scene.enter(EBotScenes.SETTINGS)
});
main.hears("Транзакції 💳", async (ctx) => {
    await ctx.scene.leave();
    return ctx.scene.enter(EBotScenes.TRANSACTIONS);
});

main.on(message("text"), (ctx) => {
  ctx.reply("Не розумію");
});


// ============ REGISTER_SCENE ============
const menuScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.MENU,
  main,
);
menuScene.enter((ctx) => {
  const keyboard = createKeyboard([
    ["Статистика 📊", "Налаштування ⚙"],
    ["Транзакції 💳"],
  ]);
  ctx.reply("Ви в меню", keyboard);
});
export { menuScene };
