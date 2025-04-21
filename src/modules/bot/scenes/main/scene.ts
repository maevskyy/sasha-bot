import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../types";
import {
  enterHandler,
  hearsSettingsHandler,
  hearsStatisticHandler,
  hearsTransactionHandler,
  onTextHandler,
} from "./hanlders";
import { uiHears } from "./ui";
import { message } from "telegraf/filters";

const menuScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.MENU,
  new Composer<IMyContext>()
);

menuScene.enter(enterHandler);
menuScene.hears(uiHears.settings, hearsSettingsHandler);
menuScene.hears(uiHears.statistic, hearsStatisticHandler);
menuScene.hears(uiHears.transactions, hearsTransactionHandler);
menuScene.on(message("text"), onTextHandler);

export { menuScene };
