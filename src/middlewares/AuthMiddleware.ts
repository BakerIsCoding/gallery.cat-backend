import { Response, NextFunction } from "express";
import { AuthService } from "@services/auth/AuthService";
import { RequestWithUser } from "@interfaces/request";
import { UserRole } from "@interfaces/auth";
import EncriptionUtils from "@utils/EncryptionUtils";

export class AuthMiddleware {
  constructor(private readonly authService: AuthService) {}

  public authenticate = (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    const header = req.header("Authorization") || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ type: "error", msg: "Token no proporcionado" });
    }

    try {
      const payload = this.authService.verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (err: any) {
      console.log("error", err);
      return res.status(401).json({ type: "error", msg: "Invalid Token" });
    }
  };

  public authorize = (...allowed: UserRole[]) => {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
      const utils = EncriptionUtils.getInstance();

      const userRole = req.user?.role;
      const decryptedRole = this.toUserRole(utils.jwtDecryptValue(userRole!));
      const userAllowed =
        allowed.length === 0 || allowed.includes(decryptedRole!);
      if (!userAllowed) {
        return res.status(403).json({ type: "error", msg: "Unauthorized" });
      }
      next();
    };
  };

  private toUserRole(value: unknown): UserRole | null {
    if (typeof value !== "number" || typeof value !== "string") return null;
    return value === UserRole.USER ||
      value === UserRole.ADMIN ||
      value === UserRole.SUPER_ADMIN
      ? (value as UserRole)
      : null;
  }
}
