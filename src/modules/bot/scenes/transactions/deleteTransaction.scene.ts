import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { getTransactionsByUserId, deleteTransactionById } from "../../../db";
import { IDbTransaction } from "../../../../common";
import { createMessageKeyboard } from "../../common/keyboards";

const PAGE_SIZE = 5;

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = page * pageSize;
  return items.slice(start, start + pageSize);
}

function formatTransactionsForDelete(
  transactions: IDbTransaction[],
  offset = 0
): string {
  return transactions
    .map(
      (transaction, index) =>
        `${index + 1 + offset * PAGE_SIZE}) 💳 Отримувач: ${
          transaction.reciever_card
        }\n` +
        `💰 Amount: ${transaction.amount} грн.\n` +
        `📅 Дата: ${transaction.created_at}`
    )
    .join("\n\n");
}

async function showTransactionPage(ctx: IMyContext) {
  const page = ctx.session.paginationPage || 0;
  const all = ctx.session.transactions || [];

  const pageTransactions = paginate(all, page, PAGE_SIZE);
  const text = formatTransactionsForDelete(pageTransactions, page);

  const buttons = pageTransactions.map((tr, i) => ({
    text: `${i + 1 + page * PAGE_SIZE}) Видалити`,
    callback_data: `delete_transaction_${tr.id}_${
      tr.card_id
    }_${encodeURIComponent(tr.amount)}`,
  }));

  const navButtons = [];
  if (page > 0)
    navButtons.push({ text: "◀️ Назад", callback_data: "prev_page" });
  if ((page + 1) * PAGE_SIZE < all.length)
    navButtons.push({ text: "Далі ▶️", callback_data: "next_page" });

  navButtons.push({ text: "Відмінити 🛑", callback_data: "cancel_delete" });

  await ctx.reply(text, createMessageKeyboard([...buttons, ...navButtons]));
}

const mainStep = new Composer<IMyContext>();

mainStep.action(/^delete_transaction_(\d+)_(\d+)_(.+)$/, async (ctx) => {
  const transactionId = Number(ctx.match[1]);
  const cardId = Number(ctx.match[2]);
  const amount = decodeURIComponent(ctx.match[3]);
  const isDeleted = await deleteTransactionById(
    ctx.chat?.id ?? 0,
    transactionId,
    cardId,
    amount
  );
  await ctx.answerCbQuery(
    isDeleted ? "Транзакцію видалено ✅" : "Помилка при видаленні ❌"
  );

  if (isDeleted) {
    ctx.session.transactions = ctx.session.transactions?.filter(
      (t) => t.id !== transactionId
    );
  }

  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.TRANSACTIONS);
});

mainStep.action("next_page", async (ctx) => {
  ctx.session.paginationPage = (ctx.session.paginationPage || 0) + 1;
  await ctx.answerCbQuery();
  return showTransactionPage(ctx);
});

mainStep.action("prev_page", async (ctx) => {
  ctx.session.paginationPage = Math.max(
    (ctx.session.paginationPage || 0) - 1,
    0
  );
  await ctx.answerCbQuery();
  return showTransactionPage(ctx);
});

mainStep.action("cancel_delete", async (ctx) => {
  await ctx.answerCbQuery("Скасовано");
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.TRANSACTIONS);
});

const deleteTransactionScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.DELETETRANSACTION,
  mainStep
);

deleteTransactionScene.enter(async (ctx) => {
  const userId = ctx.chat?.id ?? 0;
  const allTransactions = await getTransactionsByUserId(userId);

  if (!allTransactions || allTransactions.length === 0) {
    await ctx.reply("У вас поки немає транзакцій.");
    await ctx.scene.leave()
    return ctx.scene.enter(EBotScenes.TRANSACTIONS)
  }

  const sortedTransactions = [...allTransactions].sort(
    (a, b) =>
      new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
  );

  ctx.session.transactions = sortedTransactions;
  ctx.session.paginationPage = 0;

  return showTransactionPage(ctx);
});

export { deleteTransactionScene };
