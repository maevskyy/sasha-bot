import { IDBCard } from "../../../../common";

export const formatCards = (cards: IDBCard[]) => {
  return cards
    .map(
      (card, index) =>
        `${index + 1}) 💳 Ім'я карти: ${card.name}\n` +
        `🔢 Номер карти: ${card.card_number ?? "Не вказаний"}\n` +
        `🏦 Банк: ${card.bank ?? "Не вказаний"}\n` +
        `💰 Баланс: ${card.balance} грн.\n` +
        `--------------------------------------------------------\n\n`
    )
    .join("");
};

export const formatCardsForDelete = (cards: IDBCard[]) => {
  return cards
    .map(
      (card, index) =>
        `${index + 1}) 💳 Ім'я карти: ${card.name}\n` +
        `💰 Баланс: ${card.balance} грн.\n` +
        `--------------------------------------------------------\n\n`
    )
    .join("");}