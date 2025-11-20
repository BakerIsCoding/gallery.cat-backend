import path from "node:path";

const isLocalPath = () => process.env.USE_LOCAL_PATH === "true";

const localPathDir = path.join(__dirname, "../dist/backend");
const productionPathDir = path.join(__dirname, "../../backend");

export const distFolder = isLocalPath()
  ? path.join(__dirname, "../dist/")
  : path.join(__dirname, "../../");

export const rootDir = isLocalPath() ? localPathDir : productionPathDir;

export const logsDir = isLocalPath()
  ? path.join(__dirname, "../dist/logs")
  : path.join(__dirname, "../logs");
