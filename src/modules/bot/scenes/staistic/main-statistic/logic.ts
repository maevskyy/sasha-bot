import { IDbTransaction } from "../../../../../common";
import { IPreparedTransaction } from "./types";

const prepareTransactionInfo = (transactions: IDbTransaction[]): IPreparedTransaction => {
  const getAllTransactions = transactions.length;
  const getTotalAmount = transactions.reduce((acc, tx) => {
    return acc + Number(tx.amount);
  }, 0);

  return {
    totalAmount: getTotalAmount,
    totalQty: getAllTransactions,
    dayAmount: 0,
    dayQty: 0,
    weekAmount: 0,
    weekQty: 0,
    monthAmount: 0,
    monthQty: 0,
  };
};

export { prepareTransactionInfo };
