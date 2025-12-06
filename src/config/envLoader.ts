import { parseBooleanEnv, parseIntEnv } from "@utils/TypeConverters";
import * as dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  DB_HOST: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_PORT: number;
  DB_LOGS: boolean;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  SAVE_LOGS_DB: boolean;
  SAVE_LOGS_FILE: boolean;
  PORT: number;
  CUSTOM_LOGS: boolean;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRES_IN: number;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_CLEANUP_MS: number;
  TRUST_PROXY: boolean;
  ENCRYPTION_SECRET: string;
  DEBUG_MODE: boolean;
  DOMAIN: string;
}

const envConfigTyped: EnvConfig = {
  DB_HOST: getRequiredString(process.env.DB_HOST, "DB_HOST"),
  DB_NAME: getRequiredString(process.env.DB_NAME, "DB_NAME"),
  DB_USER: getRequiredString(process.env.DB_USER, "DB_USER"),
  DB_PASSWORD: getRequiredString(process.env.DB_PASSWORD, "DB_PASSWORD"),
  DB_PORT: parseIntEnv(process.env.DB_PORT, "DB_PORT"),
  DB_LOGS: parseBooleanEnv(process.env.DB_LOGS, "DB_LOGS"),

  EMAIL_HOST: getRequiredString(process.env.EMAIL_HOST, "EMAIL_HOST"),
  EMAIL_PORT: parseIntEnv(process.env.EMAIL_PORT, "EMAIL_PORT"),
  EMAIL_USER: getRequiredString(process.env.EMAIL_USER, "EMAIL_USER"),
  EMAIL_PASS: getRequiredString(process.env.EMAIL_PASS, "EMAIL_PASS"),

  SAVE_LOGS_DB: parseBooleanEnv(process.env.SAVE_LOGS_DB, "SAVE_LOGS_DB"),
  SAVE_LOGS_FILE: parseBooleanEnv(process.env.SAVE_LOGS_FILE, "SAVE_LOGS_FILE"),
  PORT: parseIntEnv(process.env.PORT, "PORT"),
  CUSTOM_LOGS: parseBooleanEnv(process.env.CUSTOM_LOGS, "CUSTOM_LOGS"),
  JWT_ACCESS_SECRET: getRequiredString(
    process.env.JWT_ACCESS_SECRET,
    "JWT_ACCESS_SECRET"
  ),
  JWT_ACCESS_TOKEN_EXPIRES_IN: parseIntEnv(
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    "JWT_ACCESS_TOKEN_EXPIRES_IN"
  ),
  RATE_LIMIT_MAX: parseIntEnv(process.env.RATE_LIMIT_MAX, "RATE_LIMIT_MAX"),
  RATE_LIMIT_WINDOW_MS: parseIntEnv(
    process.env.RATE_LIMIT_WINDOW_MS,
    "RATE_LIMIT_WINDOW_MS"
  ),
  RATE_LIMIT_CLEANUP_MS: parseIntEnv(
    process.env.RATE_LIMIT_CLEANUP_MS,
    "RATE_LIMIT_CLEANUP_MS"
  ),
  TRUST_PROXY: parseBooleanEnv(process.env.TRUST_PROXY, "TRUST_PROXY"),
  ENCRYPTION_SECRET: getRequiredString(
    process.env.ENCRYPTION_SECRET,
    "ENCRYPTION_SECRET"
  ),
  DEBUG_MODE: parseBooleanEnv(process.env.DEBUG_MODE, "DEBUG_MODE"),
  DOMAIN: getRequiredString(process.env.DOMAIN, "DOMAIN"),
};

function getRequiredString(value: string | undefined, key: string): string {
  if (value === undefined || value === "") {
    throw new Error(
      `La variable de entorno "${key}" es obligatoria y no está definida`
    );
  }
  return value;
}

const envLoad = <K extends keyof EnvConfig>(key: K): EnvConfig[K] => {
  return envConfigTyped[key];
};

export default envLoad;
