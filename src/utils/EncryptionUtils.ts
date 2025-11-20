// EncriptionUtils.ts
import envCfg from "@config/envConfig";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
  pbkdf2,
} from "crypto";
import { promisify } from "util";

const pbkdf2Async = promisify(pbkdf2);

export default class EncriptionUtils {
  private static instance?: EncriptionUtils;

  private readonly jwtKey: Buffer;
  private readonly generalKey?: Buffer;

  public static getInstance(): EncriptionUtils {
    if (!EncriptionUtils.instance) {
      EncriptionUtils.instance = new EncriptionUtils();
    }
    return EncriptionUtils.instance;
  }

  private constructor() {
    const jwtKey = envCfg("JWT_ACCESS_SECRET");

    this.jwtKey = Buffer.from(jwtKey, "base64");
    if (this.jwtKey.length !== 32) {
      throw new Error("JWT_KEY_BASE64 debe ser base64 de 32 bytes");
    }

    const generalKeyBase64 = process.env.GENERAL_KEY_BASE64;
    if (generalKeyBase64) {
      this.generalKey = Buffer.from(generalKeyBase64, "base64");
      if (this.generalKey.length !== 32) {
        throw new Error("GENERAL_KEY_BASE64 debe ser base64 de 32 bytes");
      }
    }
  }

  public jwtEncryptValue(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.jwtKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    const result = Buffer.concat([iv, tag, encrypted]);
    return EncriptionUtils.base64UrlEncode(result);
  }

  public jwtDecryptValue(token: string): string {
    const data = EncriptionUtils.base64UrlDecode(token);
    if (data.length < 12 + 16) throw new Error("Token inválido");

    const iv = data.slice(0, 12);
    const tag = data.slice(12, 28);
    const ciphertext = data.slice(28);

    const decipher = createDecipheriv("aes-256-gcm", this.jwtKey, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  }

  public async hashSensitive(
    value: string,
    iterations = 150000
  ): Promise<string> {
    const salt = randomBytes(16);
    const derived = (await pbkdf2Async(
      value,
      salt,
      iterations,
      64,
      "sha512"
    )) as Buffer;

    return `${iterations}.${salt.toString("base64")}.${derived.toString(
      "base64"
    )}`;
  }

  public async verifyHash(hash: string, plain: string): Promise<boolean> {
    try {
      const [itersStr, saltB64, derivedB64] = hash.split(".");
      const iterations = parseInt(itersStr, 10);
      const salt = Buffer.from(saltB64, "base64");
      const stored = Buffer.from(derivedB64, "base64");

      const derived = (await pbkdf2Async(
        plain,
        salt,
        iterations,
        stored.length,
        "sha512"
      )) as Buffer;

      if (derived.length !== stored.length) {
        return false;
      }
      return timingSafeEqual(derived, stored);
    } catch (e) {
      return false;
    }
  }

  private static base64UrlEncode(buf: Buffer): string {
    return buf
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  private static base64UrlDecode(str: string): Buffer {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = 4 - (str.length % 4);
    if (pad !== 4) str += "=".repeat(pad);
    return Buffer.from(str, "base64");
  }
}
