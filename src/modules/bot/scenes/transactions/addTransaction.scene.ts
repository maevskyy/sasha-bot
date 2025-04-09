import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { createKeyboard, createMessageKeyboard } from "../../common/keyboards";
import { message } from "telegraf/filters";
import { getCardsByUserId, updateCard, createTransaction } from "../../../db";
import { formatCardsForDelete } from "../../common/helpers";
import { IDBCard } from "../../../../common";

// первым делом выбрать с какой карты
// вторым делать внести карту куда
// ввести количество

const writeARecieverStep = new Composer<IMyContext>();
writeARecieverStep.on(message("text"), async (ctx) => {
  const userInput = ctx.message?.text ?? "";
  ctx.session.newTransaction.recieverCard = userInput;

  let text: string = "У вас пока немає доданих карт";
  const cards = await getCardsByUserId(ctx.chat?.id ?? 0);
  if (cards) text = formatCardsForDelete(cards);
  if (!cards) return ctx.reply(text);
  const buttons = cards.map((card, index) => ({
    text: card.name,
    callback_data: `choose_card_${index}_${card.name}`,
  }));

  const keyboard = createMessageKeyboard(buttons);
  await ctx.reply("Виберіть з якої картки провести списання");
  await ctx.reply(text, keyboard);
  return ctx.wizard.next();
});

const writeASenderStep = new Composer<IMyContext>();
writeASenderStep.action(/^choose_card_\d+_(.+)$/, async (ctx) => {
  ctx.answerCbQuery();

  const userId = ctx.chat?.id ?? 0;
  const cardName = ctx.match[1];
  const cards = await getCardsByUserId(userId);
  if (!cards) return ctx.reply("У вас немає доданих карт");
  const isUserHasCard = cards.map((card) => card.name).includes(cardName);
  if (!isUserHasCard) return ctx.reply("У вас немає такої картки");

  ctx.session.newTransaction.originCard = cards.find(
    (card) => card.name === cardName
  ) as IDBCard;
  await ctx.reply("Введіть сумму транзакції");
  return ctx.wizard.next();
});
writeASenderStep.on(message("text"), async (ctx) => {
  await ctx.reply("Введіть сумму транзакції");
  return ctx.wizard.next();
});

const writeAAmountStep = new Composer<IMyContext>();
writeAAmountStep.on(message("text"), async (ctx) => {
  const userInput = ctx.message?.text ?? "";

  const isValidNumber = /^\d+$/.test(userInput);
  if (!isValidNumber) {
    await ctx.reply("Будь ласка, введіть тільки цифри для суми.");
    return ctx.wizard.back();
  }

  const amount = Number(userInput);

  if (amount <= 0) {
    await ctx.reply("Сума повинна бути більшою за 0.");
    return ctx.wizard.back();
  }

  const { recieverCard, originCard } = ctx.session.newTransaction;

  const currentBalance = Number(originCard.balance);

  if (amount > currentBalance) {
    await ctx.reply(
      `Недостатньо коштів на картці. Доступний баланс: ${currentBalance}.`
    );
    return ctx.wizard.back();
  }

  ctx.session.newTransaction.originCard.balance = String(
    currentBalance - amount
  );

  let text: string = "Транзакція записана";
  const updatedCard = await updateCard(ctx.session.newTransaction.originCard);
  if (!updatedCard) text = "Транзакція не записана, не вдалося оновити картку";
  const createdTransaction = await createTransaction({
    user_id: ctx.chat.id,
    card_id: originCard.id as number,
    amount: String(amount),
    post_balance: String(currentBalance - amount),
    reciever_card: recieverCard,
  });
  if (!createdTransaction)
    text = "Транзакція не записана, не вдалося створити транакцію";

  await ctx.reply(text);
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.TRANSACTIONS);
});

// ============ REGISTER_SCENE ============
const addTransactionScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.ADDTRANSACTION,
  writeARecieverStep,
  writeASenderStep,
  writeAAmountStep
);

addTransactionScene.enter(async (ctx) => {
  if (!ctx.session.newTransaction) {
    ctx.session.newTransaction = {
      amount: "",
      postBalance: "",
      originCard: {
        name: "",
        user_id: 0,
        card_number: "",
        balance: "",
        bank: "",
      },
      recieverCard: "",
    };
  }
  const text = "Введіть номер картки отримувача";
  const keyboard = createKeyboard([["Відмінити створення транзакції 🛑"]]);
  await ctx.reply(text, keyboard);
});

addTransactionScene.hears("Відмінити створення транзакції 🛑", async (ctx) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.TRANSACTIONS);
});

export { addTransactionScene };
