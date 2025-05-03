import { EBotScenes, IMyContext } from "../../../types";
import { pagination } from "./logic";
import { getTransactionById } from "../../../../db";
import { Composer } from "telegraf";
import { editTransactionKeyboard, uiHears, } from "./ui";

export const onCancelEdit = async (ctx: IMyContext) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.TRANSACTIONS);
};

export const onPrevPage = async (ctx: IMyContext) => {
  ctx.session.paginationPage = Math.max(
    (ctx.session.paginationPage ?? 0) - 1,
    0
  );
  await ctx.answerCbQuery();
  return pagination(ctx);
};

export const onNextPage = async (ctx: IMyContext) => {
  const allTransactions = ctx.session.transactions || [];
  const pagesQty = Math.ceil(allTransactions.length / 5);
  ctx.session.paginationPage = Math.min(
    (ctx.session.paginationPage ?? 0) + 1,
    pagesQty - 1
  );
  await ctx.answerCbQuery();
  return pagination(ctx);
};

export const onQtyPage = async (ctx: IMyContext) => {
  await ctx.answerCbQuery();
};

export const onSelectTransaction = async (ctx: IMyContext) => {
  //@ts-ignore
  const match = ctx.match;
  const transactionId = Number(match[1]);
  const cardId = Number(match[2]);
  const amount = decodeURIComponent(match[3]);

  const transaction = await getTransactionById(transactionId);
  if (!transaction) return ctx.reply("Такої транзакції не існує");

  console.log(transactionId, cardId, amount)
  // Тут логика следующего шага будет
  await ctx.reply("Редагування транзакції...");
  await ctx.reply('Виберіть що ви будете змінювати', editTransactionKeyboard())
  return ctx.wizard.next();
};

const editTransaction = new Composer<IMyContext>()
// editTransaction.hears(uiHears.saveChanges)
// editTransaction.hears(uiHears.cancelChanges)
// editTransaction.hears(uiHears.changeOrAddPhoto)
