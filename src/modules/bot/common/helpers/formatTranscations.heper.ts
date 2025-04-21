import { IDbTransaction } from "../../../../common";

// export const formatTransactionsForDelete = (transactions: IDbTransaction[]) => {
//   return transactions
//     .map(
//       (transaction, index) =>
//         `${index + 1}) 💳 Отримувач: ${transaction.reciever_card}\n` +
//         `💰 Amount: ${transaction.amount} грн.\n` +
//         `📅 Дата: ${transaction.created_at}`,
//       `--------------------------------------------------------\n\n`
//     )
//     .join("");
// };

export function formatTransactionsForPagination(
  transactions: IDbTransaction[],
  startIndex = 0
): string {
  return transactions
    .map((transaction, index) => {
      const formattedDate = new Date(String(transaction.created_at)).toLocaleString(
        "uk-UA",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
      return (
        `${index + 1 + startIndex}) 💳 Отримувач: ${
          transaction.reciever_card
        }\n` +
        `💰 Amount: ${transaction.amount} грн.\n` +
        `📅 Дата: ${formattedDate}`
      );
    })
    .join("\n\n");
}
