export interface IDBUser {
  id: number;
  name: string;
  password: string;
  telegram_id: null | number;
  created_at: string;
}

export interface IDBCard {
  id?: number;
  name: string;
  user_id: number;
  card_number: string | null;
  balance: string;
  bank: string | null;
  created_at?: string;
}

export interface IDbTransaction {
  id?: number;
  user_id: number;
  card_id: number;
  amount: string;
  post_balance: string;
  reciever_card: string;
  created_at?: string;
}
