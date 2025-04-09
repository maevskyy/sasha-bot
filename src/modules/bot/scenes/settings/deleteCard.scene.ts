import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { deleteCardByUserAndName, getCardsByUserId } from "../../../db";
import { formatCardsForDelete } from "../../common/helpers";
import { createKeyboard, createMessageKeyboard } from "../../common/keyboards";

const mainStep = new Composer<IMyContext>();
mainStep.action(/^delete_card_\d+_(.+)$/, async (ctx) => {
  const userId = ctx.chat?.id ?? 0;
  const cardName = ctx.match[1];

  const isDeleted = await deleteCardByUserAndName(userId, cardName);
  const text = isDeleted
    ? "Картка успішно видалена ✅"
    : "Помилка при видаленні картки";

  await ctx.answerCbQuery(
    isDeleted ? "Картка успішно видалена ✅" : "Помилка при видаленні картки ❌"
  );

  await ctx.reply(text);
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.SETTINGS);
});

const deleteCardScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.DELETECARD,
  mainStep
);

deleteCardScene.enter(async (ctx) => {
  let text: string = "У вас пока немає доданих карт";
  const cards = await getCardsByUserId(ctx.chat?.id ?? 0);
  if (cards) text = formatCardsForDelete(cards);
  if (!cards) return ctx.reply(text);
  const buttons = cards.map((card, index) => ({
    text: card.name,
    callback_data: `delete_card_${index}_${card.name}`,
  }));

  await ctx.reply(
    "Виберіть картку для видалення",
    createKeyboard([["Відмінити видалення картки 🛑"]])
  );
  return ctx.reply(text, createMessageKeyboard(buttons));
});

deleteCardScene.hears("Відмінити видалення картки 🛑", async (ctx) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.SETTINGS);
});
export { deleteCardScene };
