import { IDbTransaction } from "../../../../../common";
import { getTransactionsByUserId } from "../../../../db";
import { sortTransactionByDate } from "../../../common/helpers/sortTransactions.helper";
import { IMyContext } from "../../../types";
import {
  createTransactionKeyboard,
  formatTransactionsForPagination,
} from "./ui";

const PAGE_SIZE = 5;

const paginate = (arr: IDbTransaction[], page: number, size = PAGE_SIZE) =>
  arr.slice(page * size, (page + 1) * size);

const pagination = async (ctx: IMyContext) => {
  const page = ctx.session.paginationPage || 0;
  const allTransactions = ctx.session.transactions || [];

  const transactionsPage = paginate(allTransactions, page);

  const text = formatTransactionsForPagination(
    transactionsPage,
    page * PAGE_SIZE
  );
  const keyboard = createTransactionKeyboard(allTransactions, page);

  return ctx.reply(text, keyboard);
};

const getSortedUserTransactions = async (userId: number) => {
  const transactions = await getTransactionsByUserId(userId);
  return sortTransactionByDate(transactions as IDbTransaction[]);
};

export { getSortedUserTransactions, paginate, pagination };
