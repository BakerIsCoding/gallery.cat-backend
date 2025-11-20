import chalk from "chalk";

export function parseBooleanEnv(
  value: string | undefined,
  key: string
): boolean {
  try {
    return stringToBoolean(value);
  } catch (err: any) {
    console.error(
      chalk.red(
        `\n-------------[ENV]-------------\nENV VARIABLE ERROR "${key}": ${err.message}\n`
      )
    );
    process.exit(1);
  }
}

export function parseIntEnv(value: string | undefined, key: string): number {
  try {
    return stringToInt(value);
  } catch (err: any) {
    console.error(
      chalk.red(
        `\n-------------[ENV]-------------\nENV VARIABLE ERROR "${key}": ${err.message}\n`
      )
    );
    process.exit(1);
  }
}

export function stringToBoolean(value?: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    throw new Error(`The value is not a string or a boolean "${value}"`);
  }

  const str = value.trim().toLowerCase();

  if (str === "") {
    throw new Error(`Empty value for boolean: "${value}"`);
  }

  if (str === "true") {
    return true;
  }
  if (str === "false") {
    return false;
  }

  throw new Error(`Invalid value for boolean: "${value}"`);
}

export function stringToInt(value?: string): number {
  if (value === undefined || value === "") {
    throw new Error(`Undefined value for number`);
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid value for number: "${value}"`);
  }
  return parsed;
}
