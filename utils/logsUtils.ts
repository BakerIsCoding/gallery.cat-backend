import {
  ValidationError,
  ForeignKeyConstraintError,
  UniqueConstraintError,
} from "sequelize";
import envCfg from "@config/envConfig";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { logsDir } from "../config/common";
import { DateFormatter } from "@utils/ConsoleMethods";

const source = "API-V3";

//TODO MIRAR DE HACER UNA FUNCIÓN PARA IDENTIFICAR DE QUE ARCHIVO VIENE EL ERROR
async function saveErrorLog(
  msg: string,
  log_type:
    | "info"
    | "warning"
    | "critical"
    | "error"
    | "debug"
    | "sequelize_error",
  error?: any
) {
  if (envCfg("SAVE_LOGS_FILE") === false && envCfg("SAVE_LOGS_DB") === false) {
    return;
  }

  try {
    let details: any = { msg };

    // Si es info no se procesa el error, simplemente se guarda el mensaje
    if (log_type === "info") {
      if (error) {
        details.data = error;
      }

      if (envCfg("SAVE_LOGS_FILE") === true) {
        writeLog(JSON.stringify(details), log_type);
      }

      return;
    }

    let origin = getErrorOrigin(error);

    if (error) {
      if (error instanceof ForeignKeyConstraintError) {
        log_type = "sequelize_error";
        details = {
          type: "ForeignKeyConstraintError",
          message: error.parent?.message || error.message,
          table: error.table || "Unknown",
          fields: error.fields || "Unknown",
          data: JSON.stringify(error, null, 2),
          origin,
        };
      } else if (error instanceof UniqueConstraintError) {
        log_type = "sequelize_error";
        details = {
          type: "UniqueConstraintError",
          message: error.parent?.message || error.message,
          constraint: error.errors?.map((e) => e.path).join(", ") || "Unknown",
          data:
            error.errors?.map((e) => ({
              field: e.path,
              value: e.value,
            })) || [],
          origin,
        };
      } else if (error instanceof ValidationError) {
        log_type = "sequelize_error";
        details = {
          type: "ValidationError",
          message: "Validation failed",
          data: error.errors.map((e) => ({
            field: e.path,
            message: e.message,
          })),
          origin,
        };
      } else if (error.parent?.sqlMessage) {
        log_type = "sequelize_error";
        details = {
          type: "SequelizeError",
          message: error.parent.sqlMessage,
          sql: error.sql || "N/A",
        };
      } else {
        details = {
          type: error.name || "UnknownError",
          message: error.message || "An unexpected error occurred",
          stack: error.stack
            ? error.stack.split("\n").slice(0, 5).join("\n")
            : "No stack trace",
          origin,
        };
      }
    }

    if (envCfg("SAVE_LOGS_FILE") === true) {
      writeLog(JSON.stringify(details), log_type);
    }
  } catch (err) {
    console.error("Error al guardar el log:", err);
  }
}

function getErrorOrigin(error: any): string {
  const stack = error?.stack || new Error().stack;
  if (!stack) return "Unknown";

  const stackLines = stack.split("\n");

  for (const line of stackLines) {
    const isInternalNodeModule = line.includes("node_modules");
    const isSaveLogFunction = line.includes("saveLog");

    if (!isInternalNodeModule && !isSaveLogFunction) {
      const match = line.match(/\(([^)]+)\)/) || line.match(/at\s+(.+)/);
      if (match) {
        return match[1];
      }
    }
  }

  return "Unknown";
}

export function writeLog(message: string, log_type: string): boolean {
  try {
    const timestamp = new Date().toISOString();
    const date = DateFormatter.customFormatMadridDate(new Date(), "yyyy-MM-dd");

    const logDirPath = logsDir;

    const logFilePath = path.join(logDirPath, `log_${date}.log`);

    if (!fs.existsSync(logDirPath)) {
      fs.mkdirSync(logDirPath, { recursive: true });
    }

    const logMessage = `[${timestamp}]-[${log_type.toUpperCase()}]: ${message}\n`;

    fs.appendFileSync(logFilePath, logMessage);

    return true;
  } catch (error) {
    console.error("Error writing to log file:", error);
    return false;
  }
}

export { saveErrorLog };
