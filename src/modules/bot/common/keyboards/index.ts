export const createKeyboard = (
  buttons: string[][],
  one_time_keyboard = false
) => {
  return {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true,
      one_time_keyboard: one_time_keyboard,
    },
  };
};

export const createMessageKeyboard = (
  buttons: { text: string; callback_data: string }[]
) => {
  return {
    reply_markup: {
      inline_keyboard: buttons.map((button) => [
        { text: button.text, callback_data: button.callback_data },
      ]),
    },
  };
};
