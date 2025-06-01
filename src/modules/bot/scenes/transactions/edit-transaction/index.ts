import { Composer, Scenes } from "telegraf";
import { EBotScenes, IMyContext } from "../../../types";
import { enterEditTransaction } from "./enter";
import {
  onCancelEdit,
  onNextPage,
  onPrevPage,
  onQtyPage,
  onSelectTransaction,
} from "./handlers";

const editTransactionScene = new Scenes.WizardScene<IMyContext>(
  EBotScenes.EDITTRANSACTION,
  onPrevPage,
  onNextPage,
  onQtyPage,
  onSelectTransaction
);

editTransactionScene.enter(enterEditTransaction);
editTransactionScene.action("prev_page", onPrevPage);
editTransactionScene.action("next_page", onNextPage);
editTransactionScene.action("qty_page", onQtyPage);
editTransactionScene.action(
  /^edit_transaction_(\d+)_(\d+)_(.+)$/,
  onSelectTransaction
);
editTransactionScene.hears("Відмінити редагування транзакції 🛑", onCancelEdit);

export { editTransactionScene };
