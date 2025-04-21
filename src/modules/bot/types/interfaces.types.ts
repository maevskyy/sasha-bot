import { Context, Scenes } from "telegraf";
import { WizardContextWizard } from "telegraf/typings/scenes";
import { IDBCard, IDbTransaction } from "../../../common";

interface MyWizardSession extends Scenes.WizardSessionData {
  data?: string; 
  newInfo?: string;
}

interface MySession extends Scenes.SceneSession<MyWizardSession> {
  newCard: {
    name: string;
    bank: string;
    card: string;
    balance: string;
  };
  newTransaction: {
    amount: string;
    postBalance: string;
    originCard: IDBCard;
    recieverCard: string;
  };
  editTransaction: {
    amount: string;
    postBalance: string;
    originCard: IDBCard;
    recieverCard: string;
  };
  transactions: IDbTransaction[];
  paginationPage: number;
}

export interface IMyContext extends Context {
  scene: Scenes.SceneContextScene<IMyContext, MyWizardSession>;
  wizard: WizardContextWizard<IMyContext>;
  session: MySession;

}
