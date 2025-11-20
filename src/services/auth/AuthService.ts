import jwt from "jsonwebtoken";
import { jwtConfig } from "@config/jwt";
import type { JwtPayload } from "@interfaces/auth";
import { Service } from "typedi";

@Service()
export class AuthService {
  public signAccessToken(payload: Omit<JwtPayload, "iat" | "exp">) {
    const secret: jwt.Secret = jwtConfig.accessSecret;
    const options: jwt.SignOptions = { expiresIn: jwtConfig.accessTtl };
    return jwt.sign(payload, secret, options);
  }

  /*
  public signRefreshToken(payload: Omit<JwtPayload, "iat" | "exp">) {
    const secret: jwt.Secret = jwtConfig.refreshSecret as unknown as jwt.Secret;
    const options: jwt.SignOptions = { expiresIn: jwtConfig.refreshTtl };
    return jwt.sign(payload, secret, options);
  }
    */

  public verifyAccessToken(token: string): JwtPayload {
    const secret: jwt.Secret = jwtConfig.accessSecret;
    return jwt.verify(token, secret) as JwtPayload;
  }

  /*
  public verifyRefreshToken(token: string): JwtPayload {
    const secret: jwt.Secret = jwtConfig.refreshSecret as unknown as jwt.Secret;
    return jwt.verify(token, secret) as JwtPayload;
  }
    */
}
