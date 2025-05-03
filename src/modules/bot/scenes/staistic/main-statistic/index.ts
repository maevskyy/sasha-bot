import { Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../../types";
import { enterHandler } from "./enter";
import {
  mainActionHandler,
  mainHearHandler,
  selectedCardStep,
} from "./handlers";

const statisticScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.STATISTIC,
  selectedCardStep
);

statisticScene.enter(enterHandler);
statisticScene.hears("В меню ⬅", mainHearHandler);
statisticScene.action(/^statistic_card_\d+_(.+)$/, mainActionHandler);

export { statisticScene };
