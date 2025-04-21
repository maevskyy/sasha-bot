const uiTexts = {
  dontUnderstand: "Не розумію",
  inMenu: "Ви в меню",
};

const uiHears = {
  statistic: "Статистика 📊",
  settings: "Налаштування ⚙",
  transactions: "Транзакції 💳",
};

const uiKeyboardEnter = {
  reply_markup: {
    keyboard: [[uiHears.statistic, uiHears.settings], [uiHears.transactions]],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

export { uiHears, uiTexts, uiKeyboardEnter };
