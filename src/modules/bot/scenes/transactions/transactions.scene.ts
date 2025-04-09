import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { createKeyboard } from "../../common/keyboards";
import { message } from "telegraf/filters";

const transactionComposer = new Composer<IMyContext>();
transactionComposer.hears("Додати транзакцію ➕", async (ctx) => {
  return ctx.scene.enter(EBotScenes.ADDTRANSACTION);
});
transactionComposer.hears("Видалити транзакцію 🗑", async (ctx) => {
  return ctx.scene.enter(EBotScenes.DELETETRANSACTION);
});
transactionComposer.hears("Редагувати транзакцію ✏", (ctx) => {
  return ctx.scene.enter(EBotScenes.EDITTRANSACTION);
});
transactionComposer.hears("В меню ⬅", (ctx) => {
  ctx.scene.enter(EBotScenes.MENU);
});
transactionComposer.on(message("text"), async (ctx) => {
  return ctx.reply("Не розумію");
});

const transactionsScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.TRANSACTIONS,
  transactionComposer
);

transactionsScene.enter(async (ctx) => {
  const text: string = "Ви в транзакціях";
  const myKeyboard = createKeyboard([
    ["Додати транзакцію ➕", "Редагувати транзакцію ✏"],
    ["Видалити транзакцію 🗑", "В меню ⬅"],
  ]);
  ctx.reply(text, myKeyboard);
});

export { transactionsScene };
