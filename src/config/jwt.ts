import jwt from "jsonwebtoken";
import envCfg from "./envLoader";

export const jwtConfig: {
  accessSecret: string;
  accessTtl: jwt.SignOptions["expiresIn"];
  // refreshSecret?: string;
  // refreshTtl?: jwt.SignOptions["expiresIn"];
} = {
  accessSecret: envCfg("JWT_ACCESS_SECRET"),
  accessTtl: `${envCfg("JWT_ACCESS_TOKEN_EXPIRES_IN")}m`, // Must be minutes
};
