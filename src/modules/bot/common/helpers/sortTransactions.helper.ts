import { IDbTransaction } from "../../../../common";

export const sortTransactionByDate = (transactions: IDbTransaction[]) => {
  return transactions.sort((a: IDbTransaction, b: IDbTransaction) => {
    return (
      new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    );
  });
};
