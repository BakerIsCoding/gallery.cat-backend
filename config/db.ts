import { Sequelize } from "sequelize-typescript";
import envCfg from "@config/envLoader";
import path from "node:path";

export class Database {
  private static _instance: Database | null = null;
  public sequelize: Sequelize;

  private constructor() {
    //TODO: Configure pool from env variables
    const pool = {
      max: 30,
      min: 1,
      acquire: 30000,
      idle: 10000,
    };

    this.sequelize = new Sequelize({
      dialect: "mysql",
      host: envCfg("DB_HOST") ?? "localhost",
      port: envCfg("DB_PORT") ?? 3306,
      username: envCfg("DB_USER") ?? "",
      password: envCfg("DB_PASSWORD") ?? "",
      database: envCfg("DB_NAME") ?? "",
      pool,
      logging: envCfg("DB_LOGS") === true ? console.log : false,
      timezone: "+00:00",
      models: [path.resolve(__dirname, "../src/models")],
    });
  }

  public static getInstance(): Database {
    if (!Database._instance) {
      Database._instance = new Database();
    }
    return Database._instance;
  }

  public async testConnection(): Promise<void> {
    await this.sequelize.authenticate();
  }

  public async close(): Promise<void> {
    await this.sequelize.close();
    Database._instance = null;
  }
}

export default Database;
