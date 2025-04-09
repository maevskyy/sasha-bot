import { IDbTransaction } from "../../../../common";


export const formatTransactionsForDelete = (transactions: IDbTransaction[]) => {
  return transactions
    .map(
      (transaction, index) =>
        `${index + 1}) 💳 Отримувач: ${transaction.reciever_card}\n` +
        `💰 Amount: ${transaction.amount} грн.\n` +
        `📅 Дата: ${transaction.created_at}`,
      `--------------------------------------------------------\n\n`
    )
    .join("");
};
