import { IDBCard } from "../../../../../common";
import { IPreparedTransaction } from "./types";

const cardsInlineKeybord = (
  cards: IDBCard[]
): { text: string; callback_data: string }[][] => {
  const result: { text: string; callback_data: string }[][] = [];

  for (let i = 0; i < cards.length; i += 3) {
    const row = cards.slice(i, i + 3).map((card, index) => ({
      text: card.name,
      callback_data: `statistic_card_${i + index}_${card.id}`,
    }));
    result.push(row);
  }
  result.push([
    {
      text: "Всі карти",
      callback_data: "statistic_card_0_all",
    },
  ]);

  return result;
};

const cardStatisticText = (
  transactionsInfo: IPreparedTransaction,
  cardName: string = "всі картки"
) => {
  const {
    totalAmount,
    totalQty,
    dayAmount,
    dayQty,
    weekAmount,
    weekQty,
    monthAmount,
    monthQty,
  } = transactionsInfo;

  return (
    `Картка: ${cardName}\n` +
    `Всього транзакцій: ${totalQty}\n` +
    `Загальна сума: ${totalAmount} грн\n\n` +
    `📅 За сьогодні: ${dayQty} транзакцій на суму ${dayAmount} грн\n` +
    `📆 За тиждень: ${weekQty} транзакцій на суму ${weekAmount} грн\n` +
    `🗓️ За місяць: ${monthQty} транзакцій на суму ${monthAmount} грн`
  );
};

export { cardsInlineKeybord, cardStatisticText };
