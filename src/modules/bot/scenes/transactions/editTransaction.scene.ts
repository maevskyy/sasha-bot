import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { getTransactionById, getTransactionsByUserId } from "../../../db";
import { sortTransactionByDate } from "../../common/helpers/sortTransactions.helper";
import { createKeyboard } from "../../common/keyboards";
import { formatTransactionsForPagination } from "../../common/helpers";

const PAGE_SIZE = 5;

const paginate = <T>(arr: T[], page: number, pageSize: number): T[] => {
  return arr.slice(page * pageSize, (page + 1) * pageSize);
};

const pagination = async (ctx: IMyContext) => {
  const page = ctx.session.paginationPage || 0;
  const allTransactions = ctx.session.transactions || [];
  const pagesQty = Math.ceil(allTransactions.length / PAGE_SIZE);

  const transactionsPerPage = paginate(allTransactions, page, PAGE_SIZE);

  const transactionsButtons = transactionsPerPage.map((tr, index) => ({
    text: String(index + 1 + page * PAGE_SIZE),
    callback_data: `edit_transaction_${tr.id}_${
      tr.card_id
    }_${encodeURIComponent(tr.amount)}`,
  }));

  const navigateButtons: { text: string; callback_data: string }[] = [];

  if (page > 0) {
    navigateButtons.push({ text: "◀️ Назад", callback_data: "prev_page" });
  }
  if (page < pagesQty - 1) {
    navigateButtons.push({ text: "Далі ▶️", callback_data: "next_page" });
  }

  navigateButtons.push({
    text: `${page + 1}/${pagesQty}`,
    callback_data: "qty_page",
  });

  const text = formatTransactionsForPagination(
    transactionsPerPage,
    page * PAGE_SIZE
  );

  return ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [transactionsButtons, navigateButtons],
    },
  });
};

const selectStep = new Composer<IMyContext>();
selectStep.action("prev_page", async (ctx) => {
  ctx.session.paginationPage = Math.max(
    (ctx.session.paginationPage ?? 0) - 1,
    0
  );
  await ctx.answerCbQuery();
  return await pagination(ctx);
});

selectStep.action("next_page", async (ctx) => {
  const allTransactions = ctx.session.transactions || [];
  const pagesQty = Math.ceil(allTransactions.length / PAGE_SIZE);
  ctx.session.paginationPage = Math.min(
    (ctx.session.paginationPage ?? 0) + 1,
    pagesQty - 1
  );
  await ctx.answerCbQuery();
  return await pagination(ctx);
});

selectStep.action("qty_page", async (ctx) => {
  await ctx.answerCbQuery();
});
selectStep.action(/^edit_transaction_(\d+)_(\d+)_(.+)$/, async (ctx) => {
  const transactionId = Number(ctx.match[1]);
  const cardId = Number(ctx.match[2]);
  const amount = decodeURIComponent(ctx.match[3]);
  const transaction = await getTransactionById(transactionId);
  if(!transaction) return ctx.reply('Такої транзакції не існує')
  // ctx.session.editTransaction = {
  //   amount: transaction.amount,
  //   postBalance: transaction.post_balance,
  //   originCard: transaction.
  // }
  const buttons = ''
  await ctx.reply('')
  return ctx.wizard.next()
  console.log(transactionId, "we are in the editing transaction");
});

const editStep = new Composer<IMyContext>()


/////////////////// REGISTER SCENE ////////////////////////
const editTransactionScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.EDITTRANSACTION,
  selectStep
);

editTransactionScene.enter(async (ctx) => {
  const userId = ctx.chat?.id ?? 0;
  const allTransactions = await getTransactionsByUserId(userId);

  if (!allTransactions || allTransactions.length === 0) {
    await ctx.reply("У вас поки немає транзакцій.");
    await ctx.scene.leave();
    return ctx.scene.enter(EBotScenes.TRANSACTIONS);
  }
  ctx.session.transactions = sortTransactionByDate(allTransactions);
  ctx.session.paginationPage = 0;
  await ctx.reply(
    "Виберіть транзакцію для редагування",
    createKeyboard([["Відмінити редагування транзакції 🛑"]])
  );
  return await pagination(ctx);
});

editTransactionScene.hears(
  "Відмінити редагування транзакції 🛑",
  async (ctx) => {
    await ctx.scene.leave();
    return ctx.scene.enter(EBotScenes.TRANSACTIONS);
  }
);

export { editTransactionScene };
