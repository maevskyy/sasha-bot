import { IDbTransaction } from "../../../../../common";
import { IPreparedTransaction } from "./types";
import dayjs from "dayjs";

const prepareTransactionInfo = (transactions: IDbTransaction[]): IPreparedTransaction => {
  const now = dayjs();
  const oneDayAgo = now.subtract(1, 'day');
  const oneWeekAgo = now.subtract(1, 'week');
  const oneMonthAgo = now.subtract(1, 'month');

  let dayAmount = 0;
  let dayQty = 0;
  let weekAmount = 0;
  let weekQty = 0;
  let monthAmount = 0;
  let monthQty = 0;

  const totalAmount = transactions.reduce((acc, tx) => {
    const createdAt = tx.created_at ? dayjs(tx.created_at) : null;
    const amount = Number(tx.amount);

    if (createdAt) {
      if (createdAt.isAfter(oneDayAgo)) {
        dayAmount += amount;
        dayQty++;
      }
      if (createdAt.isAfter(oneWeekAgo)) {
        weekAmount += amount;
        weekQty++;
      }
      if (createdAt.isAfter(oneMonthAgo)) {
        monthAmount += amount;
        monthQty++;
      }
    }

    return acc + amount;
  }, 0);

  return {
    cardName: transactions[0].cards?.name ?? 'Не має імені',
    totalAmount,
    totalQty: transactions.length,
    dayAmount,
    dayQty,
    weekAmount,
    weekQty,
    monthAmount,
    monthQty,
  };
};

export { prepareTransactionInfo };
