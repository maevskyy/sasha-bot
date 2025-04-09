import { menuScene } from "./main/menu.scene";
import { authScene } from "./auth/auth.scene";
import {
  settingsScene,
  addCardScene,
  deleteCardScene,
  editCardScene,
} from "./settings";
import {
  transactionsScene,
  addTransactionScene,
  deleteTransactionScene,
  editTransactionScene
} from "./transactions";

export const scenes = [
  authScene,
  menuScene,
  settingsScene,
  addCardScene,
  deleteCardScene,
  editCardScene,
  transactionsScene,
  addTransactionScene,
  deleteTransactionScene,
  editTransactionScene
];
