import { IDBCard } from "../../../../../common";
import { IPreparedTransaction } from "./types";

const cardsInlineKeybord = (
  cards: IDBCard[]
): { text: string; callback_data: string }[][] => {
  const result: { text: string; callback_data: string }[][] = [];

  for (let i = 0; i < cards.length; i += 3) {
    const row = cards.slice(i, i + 3).map((card, index) => ({
      text: card.name,
      callback_data: `statistic_card_${i + index}_${card.id}_${card.name}`,
    }));
    result.push(row);
  }
  result.push([
    {
      text: "Всі карти",
      callback_data: "statistic_card_0_all_all",
    },
  ]);

  return result;
};

const cardStatisticText = (
  transactionsInfo: IPreparedTransaction,
  cardName: string = "всі картки"
) => {
  const { totalAmount, totalQty } = transactionsInfo;
  return (
    `Картки: ${cardName}\n` +
    `Всього транзакцій: ${totalQty}\n` +
    `Загальна сума: ${totalAmount} грн\n `
  );
};

export { cardsInlineKeybord, cardStatisticText };
