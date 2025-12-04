import { Request, Response, NextFunction } from "express";
import chalk from "chalk";
import { saveErrorLog } from "utils/logsUtils";
import envCfg from "@config/envLoader";

export function GlobalErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(error);
  }

  console.error(
    chalk.red(
      "[GlobalErrorHandler] Unhandled error:",
      error.message || error.toString()
    )
  );

  saveErrorLog("error", "critical", {
    message: error.message,
    stack: error.stack,
  });

  // Si el debug mode está activado se imprime el error en la consola
  if (envCfg("DEBUG_MODE")) {
    console.error(error);
  }

  res.status(500).json({
    type: "error",
    msg: "Internal Server Error",
  });
}
