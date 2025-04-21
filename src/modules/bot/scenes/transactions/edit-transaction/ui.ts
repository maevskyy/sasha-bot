import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { IDbTransaction } from "../../../../../common";

const createCancelEditKeyboard = () => ({
  reply_markup: {
    keyboard: [["Відмінити редагування транзакції 🛑"]],
    resize_keyboard: true,
  },
});

const createTransactionKeyboard = (
  transactions: IDbTransaction[],
  page: number
) => {
  const PAGE_SIZE = 5;
  const buttons: InlineKeyboardButton[][] = [];

  const pageItems = transactions.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );
  const trxButtons = pageItems.map((tr, index) => ({
    text: String(index + 1 + page * PAGE_SIZE),
    callback_data: `edit_transaction_${tr.id}_${
      tr.card_id
    }_${encodeURIComponent(tr.amount)}`,
  }));

  const navButtons: InlineKeyboardButton[] = [];
  const pagesQty = Math.ceil(transactions.length / PAGE_SIZE);

  if (page > 0)
    navButtons.push({ text: "◀️ Назад", callback_data: "prev_page" });
  if (page < pagesQty - 1)
    navButtons.push({ text: "Далі ▶️", callback_data: "next_page" });
  navButtons.push({
    text: `${page + 1}/${pagesQty}`,
    callback_data: "qty_page",
  });

  return {
    reply_markup: {
      inline_keyboard: [trxButtons, navButtons],
    },
  };
};

const formatTransactionsForPagination = (
  transactions: IDbTransaction[],
  startIndex = 0
): string => {
  return transactions
    .map((transaction, index) => {
      const formattedDate = new Date(
        String(transaction.created_at)
      ).toLocaleString("uk-UA", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        `${index + 1 + startIndex}) 💳 Отримувач: ${
          transaction.reciever_card
        }\n` +
        `💰 Amount: ${transaction.amount} грн.\n` +
        `📅 Дата: ${formattedDate}`
      );
    })
    .join("\n\n");
};

export {
  formatTransactionsForPagination,
  createCancelEditKeyboard,
  createTransactionKeyboard,
};
