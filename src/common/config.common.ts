import dotenv from "dotenv";
dotenv.config();

interface IInternalConfig {
  bot_token: string;
  log_level: string;
  db: IDbConfig;
}

interface IDbConfig {
  redis: {
    port: number;
    host: string;
    user: string;
    password: string;
  };
  supabase: {
    key: string;
    url: string;
  };
}

export const internalConfig: IInternalConfig = {
  bot_token: process.env.BOT_TOKEN ?? "",
  log_level: process.env.LOG_LEVEL ?? "info",
  db: {
    redis: {
      port: Number(process.env.REDIS_PORT ?? 6379),
      host: process.env.REDIS_HOST ?? "redis",
      user: process.env.REDIS_USER ?? "test",
      password: process.env.REDIS_PASSWORD ?? "test",
    },
    supabase: {
      url: process.env.SUPABASE_URL ?? "",
      key: process.env.SUPABASE_KEY ?? "",
    },
  },
};
