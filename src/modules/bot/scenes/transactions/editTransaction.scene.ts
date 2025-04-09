import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { getTransactionsByUserId } from "../../../db";
import { sortTransactionByDate } from "../../common/helpers/sortTransactions.helper";

const PAGE_SIZE = 5;

const paginate = <T>(arr: T[], page: number, pageSize: number): T[] => {
  return arr.slice(page * pageSize, (page + 1) * pageSize);
};

const pagination = async (ctx: IMyContext) => {
  const page = ctx.session.paginationPage || 0;
  const allTransactions = ctx.session.transactions || [];
  const transactionsPerPage = paginate(allTransactions, page, PAGE_SIZE);
  const pagesQty = Math.round(ctx.session.transactions.length / PAGE_SIZE);
  const navigateButtons = [];
  const transactionsButtons = transactionsPerPage.map((tr, index) => ({
    text: String(index + 1),
    callback_data: `edit_transaction_${tr.id}_${
      tr.card_id
    }_${encodeURIComponent(tr.amount)}`,
  }));

  if (page > 0) {
    navigateButtons.push({ text: "◀️ Назад", callback_data: "prev_page" });
    navigateButtons.push({ text: "Далі ▶️", callback_data: "next_page" });
  }
  navigateButtons.push({
    text: `${page + 1}/${pagesQty}`,
    callback_data: "qty_page",
  });

  ctx.reply("Some transacrions", {
    reply_markup: {
      inline_keyboard: [transactionsButtons, navigateButtons],
    },
  });
};

const selectStep = new Composer<IMyContext>();

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

  return await pagination(ctx);
});

export { editTransactionScene };
