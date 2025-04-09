import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import { getCardsByUserId, updateCard } from "../../../db";
import { createKeyboard, createMessageKeyboard } from "../../common/keyboards";
import { message } from "telegraf/filters";
import { formatCards } from "../../common/helpers";

const mainStep = new Composer<IMyContext>();
const editNameStep = new Composer<IMyContext>();
const editCardNumberStep = new Composer<IMyContext>();
const editBankStep = new Composer<IMyContext>();
const editBalanceStep = new Composer<IMyContext>();

mainStep.action(/^edit_card_\d+_(.+)$/, async (ctx) => {
  const cardName = ctx.match[1];
  const userId = ctx.chat?.id ?? 0;
  const cards = await getCardsByUserId(userId);
  const selectedCard = cards?.find((card) => card.name === cardName);
  if (!selectedCard) {
    await ctx.reply("Помилка: картку не знайдено ❌");
    return ctx.scene.leave();
  }

  ctx.session.newCard = {
    name: selectedCard.name,
    bank: selectedCard.bank ?? "Не вказано",
    balance: selectedCard.balance,
    card: selectedCard.card_number ?? "Не вказано",
  };
  const keyboard = createKeyboard([
    ["Редагувати назву", "Редагувати номер картки"],
    ["Редагувати банк", "Редагувати баланс"],
    ["Зберегти зміни ✅", "Відмінити редагування 🛑"],
  ]);

  return ctx.reply(
    `Редагування картки: ${selectedCard.name}\nВиберіть, що редагувати:`,
    keyboard
  );
});

mainStep.hears("Відмінити редагування 🛑", async (ctx) => {
  await ctx.reply("Редагування скасовано.");
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.SETTINGS);
});

mainStep.hears("Редагувати назву", async (ctx) => {
  ctx.reply("Введіть нову назву картки:");
  return ctx.wizard.next();
});
editNameStep.on(message("text"), async (ctx) => {
  ctx.session.newCard.name = ctx.message.text;
  ctx.reply(`Назва змінена на: ${ctx.session.newCard.name}`);
  return ctx.wizard.selectStep(0);
});

mainStep.hears("Редагувати номер картки", async (ctx) => {
  ctx.reply("Введіть новий номер картки:");
  return ctx.wizard.selectStep(2);
});
editCardNumberStep.on(message("text"), async (ctx) => {
  ctx.session.newCard.card = ctx.message.text;
  ctx.reply(`Номер картки змінено на: ${ctx.session.newCard.card}`);
  return ctx.wizard.selectStep(0);
});

mainStep.hears("Редагувати банк", async (ctx) => {
  ctx.reply("Введіть нову назву банку:");
  return ctx.wizard.selectStep(3);
});
editBankStep.on(message("text"), async (ctx) => {
  ctx.session.newCard.bank = ctx.message.text;
  ctx.reply(`Банк змінено на: ${ctx.session.newCard.bank}`);
  return ctx.wizard.selectStep(0);
});

mainStep.hears("Редагувати баланс", async (ctx) => {
  ctx.reply("Введіть новий баланс (тільки цифри):");
  return ctx.wizard.selectStep(4);
});
editBalanceStep.on(message("text"), async (ctx) => {
  const balance = ctx.message.text;
  if (!/^\d+$/.test(balance)) {
    ctx.reply("Будь ласка, введіть тільки цифри для балансу.");
    return;
  }
  ctx.session.newCard.balance = balance;
  ctx.reply(`Баланс змінено на: ${ctx.session.newCard.balance}`);
  return ctx.wizard.selectStep(0);
});

mainStep.hears("Зберегти зміни ✅", async (ctx) => {
  const { name, balance, bank, card } = ctx.session.newCard;
  const isUpdated = await updateCard({
    user_id: ctx.chat.id ?? 0,
    card_number: card,
    name,
    balance,
    bank,
  });
  const text = isUpdated
    ? "Зміни успішно збережено ✅"
    : "Не вдалось внести зміни ";
  await ctx.reply(text);
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.SETTINGS);
});

// ============ REGISTER_SCENE ============
const editCardScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.EDITCARD,
  mainStep,
  editNameStep,
  editCardNumberStep,
  editBankStep,
  editBalanceStep
);

editCardScene.enter(async (ctx) => {
  let text = "У вас поки немає доданих карт";
  const cards = await getCardsByUserId(ctx.chat?.id ?? 0);

  if (cards) text = formatCards(cards);
  if (!cards) return ctx.reply(text);

  ctx.session.newCard = { name: "", bank: "", balance: "", card: "" };

  const buttons = cards.map((card, index) => ({
    text: card.name,
    callback_data: `edit_card_${index}_${card.name}`,
  }));
  await ctx.reply(
    "Виберіть картку для редагування",
    createKeyboard([["Відмінити редагування картки 🛑"]])
  );
  return ctx.reply(text, createMessageKeyboard(buttons));
});

editCardScene.hears("Відмінити редагування картки 🛑", async (ctx) => {
  await ctx.scene.leave();
  return ctx.scene.enter(EBotScenes.SETTINGS);
});

export { editCardScene };
