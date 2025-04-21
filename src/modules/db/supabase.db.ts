import { createClient } from "@supabase/supabase-js";
import {
  EDBTables,
  IDBCard,
  IDbTransaction,
  IDBUser,
  internalConfig,
} from "../../common";
import { logger } from "../../common";
import { redisClient } from "./redis.db";

const { url, key } = internalConfig.db.supabase;
const client = createClient(url, key);

const supabasePing = async () => {
  const { error } = await client.rpc("ping");
  return !error;
};

const getUserByChatId = async (chatId: number): Promise<null | IDBUser> => {
  const cacheKey = `user:${chatId}`;
  const cachedUser = await redisClient.get(cacheKey);
  if (cachedUser) {
    return JSON.parse(cachedUser);
  }

  const { data, error } = await client
    .from(EDBTables.USERS)
    .select("*")
    .eq("telegram_id", chatId)
    .limit(1);

  if (error) {
    logger.error(`Error during getUserByChatId: ${error}`);
    return null;
  }

  const user = data[0];

  if (user) {
    await redisClient.set(cacheKey, JSON.stringify(user), "EX", 3600);
  }

  return user;
};
const getCardsByUserId = async (chatId: number): Promise<null | IDBCard[]> => {
  const { data, error } = await client
    .from(EDBTables.CARDS)
    .select("*")
    .eq("user_id", chatId);

  if (error) {
    logger.error(`Error during getCardsByUserId: ${error}`);
    return null;
  }
  if (!data || data.length === 0) {
    return null;
  }

  return data;
};

const createCard = async (cardInfo: IDBCard): Promise<boolean> => {
  const prepareCard: IDBCard = {
    user_id: cardInfo.user_id,
    name: cardInfo.name,
    balance: cardInfo.balance,
    bank: cardInfo.bank ?? null,
    card_number: cardInfo.card_number ?? null,
  };
  const { error } = await client.from(EDBTables.CARDS).insert(prepareCard);
  if (error) {
    logger.error(`Error during createCard: ${error}`);
    return false;
  }

  return true;
};

const updateCard = async (cardInfo: IDBCard): Promise<boolean> => {
  const prepareCard: IDBCard = {
    user_id: cardInfo.user_id,
    name: cardInfo.name,
    balance: cardInfo.balance,
    bank: cardInfo.bank ?? null,
    card_number: cardInfo.card_number ?? null,
  };
  const { error } = await client
    .from(EDBTables.CARDS)
    .update(prepareCard)
    .eq("user_id", prepareCard.user_id)
    .eq("name", prepareCard.name);
  if (error) {
    logger.error(`Error during updateCard: ${error}`);
    return false;
  }

  return true;
};

const deleteCardByUserAndName = async (
  userId: number,
  cardName: string
): Promise<boolean> => {
  const { error } = await client
    .from(EDBTables.CARDS)
    .delete()
    .eq("user_id", userId)
    .eq("name", cardName);
  if (error) {
    logger.error(`Error during deleteCard: ${error}`);
    return false;
  }

  return true;
};

const getTransactionsByUserId = async (
  chatId: number
): Promise<null | IDbTransaction[]> => {
  const { data, error } = await client
    .from(EDBTables.TRANSACTIONS)
    .select("*")
    .eq("user_id", chatId);

  if (error) {
    logger.error(`Error during getTransactionsByUserId: ${error}`);
    return null;
  }
  if (!data || data.length === 0) {
    return null;
  }

  return data;
};

const getTransactionsByCardId = async (
  card_id: number
): Promise<null | IDbTransaction[]> => {
  const { data, error } = await client
    // .from(EDBTables.TRANSACTIONS)
    // .select("*")
    // .eq("card_id", card_id);
    .from(EDBTables.TRANSACTIONS)
    .select("*, card(name)") // ← тут JOIN
    .eq("card_id", card_id);

  if (error) {
    logger.error(`Error during getTransactionsByCardId: ${error}`);
    return null;
  }
  if (!data || data.length === 0) {
    return null;
  }

  return data;
};

const getTransactionById = async (
  transaction_id: number
): Promise<IDbTransaction | null> => {
  const { data, error } = await client
    .from(EDBTables.TRANSACTIONS)
    .select("*")
    .eq("id", transaction_id)
    .single();

  if (error) {
    logger.error(`Error during getTransactionById: ${error}`);
    return null;
  }
  if (!data || data.length === 0) {
    return null;
  }

  return data;
};

const createTransaction = async (
  transaction: IDbTransaction
): Promise<boolean> => {
  const { error } = await client
    .from(EDBTables.TRANSACTIONS)
    .insert(transaction);
  if (error) {
    logger.error(`Error createTransaction createCard: ${error}`);
    return false;
  }

  return true;
};

const deleteTransactionById = async (
  user_id: number,
  transaction_id: number,
  card_id: number,
  amount: string
): Promise<boolean> => {
  const { data, error } = await client.rpc(
    "delete_transaction_and_update_balance",
    {
      p_user_id: user_id,
      p_transaction_id: transaction_id,
      p_card_id: card_id,
      p_amount: amount,
    }
  );

  if (error) {
    logger.error(
      `Failed to delete transaction and update balance: ${error.message}`
    );
    return false;
  }

  return data;
};

export {
  getUserByChatId,
  getCardsByUserId,
  createCard,
  deleteCardByUserAndName,
  updateCard,
  createTransaction,
  getTransactionsByUserId,
  deleteTransactionById,
  getTransactionsByCardId,
  getTransactionById,
  supabasePing,
};
