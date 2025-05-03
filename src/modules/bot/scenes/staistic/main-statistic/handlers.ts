import { Composer } from "telegraf";
import {
  getTransactionsByCardId,
  getTransactionsByUserId,
} from "../../../../db";
import { EBotScenes, IMyContext } from "../../../types";
import { cardStatisticText } from "./ui";
import { prepareTransactionInfo } from "./logic";

const mainHearHandler = async (ctx: IMyContext) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.MENU);
};
const mainActionHandler = async (ctx: IMyContext) => {
  await ctx.answerCbQuery();
  const userId = ctx.chat?.id ?? 0;
  //@ts-ignore
  const card = ctx.match[1];
    //@ts-ignore
  console.log(ctx.match[1], "this is caed");
  if (card === "all") {
    const allTransactions = await getTransactionsByUserId(userId);
    if (!allTransactions) return ctx.reply("Цей користувач не має траназкцій");
    const preparedTransactions = prepareTransactionInfo(allTransactions);
    return ctx.reply(cardStatisticText(preparedTransactions));
  }
  const transactionByCard = await getTransactionsByCardId(card);
  if (!transactionByCard) return ctx.reply("По цій картці немає транзакцій");
  const preparedTransactions = prepareTransactionInfo(transactionByCard);
  return ctx.reply(cardStatisticText(preparedTransactions, preparedTransactions.cardName));
};

const selectedCardStep = new Composer<IMyContext>();

export { mainActionHandler, mainHearHandler, selectedCardStep };
