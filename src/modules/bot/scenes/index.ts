import { menuScene } from "./main";
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

import { statisticScene } from "./staistic";

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
  editTransactionScene,
  statisticScene
];
