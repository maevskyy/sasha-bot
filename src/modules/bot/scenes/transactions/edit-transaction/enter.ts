import { IMyContext } from "../../../types";
import { getSortedUserTransactions } from "./logic";
import { createCancelEditKeyboard } from "./ui";
import { pagination } from "./logic";

export const enterEditTransaction = async (ctx: IMyContext) => {
  const userId = ctx.chat?.id ?? 0;
  const allTransactions = await getSortedUserTransactions(userId);

  if (!allTransactions || allTransactions.length === 0) {
    await ctx.reply("У вас поки немає транзакцій.");
    return ctx.scene.enter("TRANSACTIONS");
  }

  ctx.session.transactions = allTransactions;
  ctx.session.paginationPage = 0;

  await ctx.reply(
    "Виберіть транзакцію для редагування",
    createCancelEditKeyboard()
  );
  return await pagination(ctx);
};
