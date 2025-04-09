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
const getCardsByUserId = async (
  chatId: number,
  updateCache: boolean = false
): Promise<null | IDBCard[]> => {
  const cacheKey = `cards:${chatId}`;

  if (!updateCache) {
    const cachedCards = await redisClient.get(cacheKey);
    if (cachedCards) {
      return JSON.parse(cachedCards);
    }
  } else {
    await redisClient.del(cacheKey);
  }

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

  if (data && data.length !== 0) {
    await redisClient.set(cacheKey, JSON.stringify(data), "EX", 3600);
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

  await getCardsByUserId(cardInfo.user_id, true);

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

  await getCardsByUserId(cardInfo.user_id, true);

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

  await getCardsByUserId(Number(userId), true);

  return true;
};

const getTransactionsByUserId = async (
  chatId: number,
  updateCache: boolean = false
): Promise<null | IDbTransaction[]> => {
  const cacheKey = `transactions:${chatId}`;

  if (!updateCache) {
    const cachedTransactions = await redisClient.get(cacheKey);
    if (cachedTransactions) {
      return JSON.parse(cachedTransactions);
    }
  } else {
    await redisClient.del(cacheKey);
  }

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

  if (data && data.length !== 0) {
    await redisClient.set(cacheKey, JSON.stringify(data), "EX", 3600);
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

  await getTransactionsByUserId(transaction.user_id, true);

  return true;
};

const deleteTransactionById = async (
  user_id: number,
  transaction_id: number,
  card_id: number,
  amount: string
): Promise<boolean> => {
  const { error } = await client
    .from(EDBTables.TRANSACTIONS)
    .delete()
    .eq("user_id", user_id)
    .eq("id", transaction_id);
  if (error) {
    logger.error(`Error during deleteTransactionById: ${error}`);
    return false;
  }

  const { data: cardData, error: cardError } = await client
    .from(EDBTables.CARDS)
    .select("*")
    .eq("user_id", user_id)
    .eq("id", card_id);

  if (cardError) {
    logger.error(`Error during deleteTransactionById: ${error}`);
    return false;
  }

  const typesCardData = cardData[0] as IDBCard
  
  await updateCard({
    ...typesCardData,
    balance: String(Number(typesCardData.balance) + Number(amount))
  })

  await getCardsByUserId(user_id, true)
  await getTransactionsByUserId(user_id, true);

  return true;
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
};
