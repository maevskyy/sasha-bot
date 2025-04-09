import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { createKeyboard } from "../../common/keyboards";
import { message } from "telegraf/filters";
import { createCard, getCardsByUserId } from "../../../db";

const firstStep = new Composer<IMyContext>();
firstStep.on(message("text"), async (ctx) => {
  const userInput = ctx.message?.text ?? "";

  const userCards = await getCardsByUserId(ctx.chat?.id ?? 0);

  const isNameTaken = userCards?.some((card) => card.name === userInput);

  if (isNameTaken) {
    const errorText = "У вас уже є картка з такою назвою.";
    await ctx.reply(errorText);
    return ctx.wizard.selectStep(0);
  }

  const text = "Додайте номер карти";
  (ctx as IMyContext).session.newCard.name = userInput;
  ctx.reply(text);
  ctx.wizard.next();
});

const secondStep = new Composer<IMyContext>();
secondStep.on(message("text"), async (ctx) => {
  const userInput = ctx.message?.text ?? "";
  const text = "Додайте банк";
  (ctx as IMyContext).session.newCard.card = userInput;
  ctx.reply(text);
  return ctx.wizard.next();
});

const thirdStep = new Composer<IMyContext>();
thirdStep.on(message("text"), async (ctx) => {
  const userInput = ctx.message?.text ?? "";

  const text = "Додайте баланс";
  ctx.session.newCard.bank = userInput;
  ctx.reply(text);
  return ctx.wizard.next();
});

const fourthStep = new Composer<IMyContext>();
fourthStep.on(message("text"), async (ctx) => {
  const userInput = ctx.message?.text ?? "";

  const isValidNumber = /^\d+$/.test(userInput);
  if (!isValidNumber) {
    const errorText = "Будь ласка, введіть тільки цифри для балансу.";
    await ctx.reply(errorText);
    return ctx.wizard.back();
  }
  ctx.session.newCard.balance = userInput;
  const { name, balance, bank, card } = ctx.session.newCard;
  const writeCardToDb = await createCard({
    user_id: ctx.chat.id,
    card_number: card,
    name,
    balance,
    bank,
  });
  let text = "Ви успішно створили картку!";

  if(!writeCardToDb) text = 'Помилка, додати картку не вийшло'

  ctx.reply(text);
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.SETTINGS);
});

// ============ REGISTER_SCENE ============
const addCardScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.ADDCARD,
  firstStep,
  secondStep,
  thirdStep,
  fourthStep
);
addCardScene.enter((ctx) => {
  const text = "Додайте назву карти";
  if (!ctx.session.newCard) {
    ctx.session.newCard = { name: "", bank: "", balance: "", card: "" };
  }
  const keyboard = createKeyboard([["Відмінити створення картки 🛑"]]);
  ctx.reply(text, keyboard);
});
addCardScene.hears("Відмінити створення картки 🛑", async (ctx) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.SETTINGS);
});
export { addCardScene };
