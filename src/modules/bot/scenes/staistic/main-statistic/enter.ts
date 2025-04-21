import { getCardsByUserId } from "../../../../db";
import { formatCards } from "../../../common/helpers";
import { createKeyboard } from "../../../common/keyboards";
import { IMyContext } from "../../../types";
import { cardsInlineKeybord } from "./ui";

const enterHandler = async (ctx: IMyContext) => {
  let text: string = "У вас пока немає доданих карт";
  const cards = await getCardsByUserId(ctx.chat?.id ?? 0);
  if (cards) text = formatCards(cards);
  if (!cards) return ctx.reply(text);
  const keyboard = createKeyboard([["В меню ⬅"]]);

  await ctx.reply("Виберіть картку для статистики:", keyboard);
  return ctx.reply(text, {
    reply_markup: {
      inline_keyboard: cardsInlineKeybord(cards),
    },
  });
};

export { enterHandler };
