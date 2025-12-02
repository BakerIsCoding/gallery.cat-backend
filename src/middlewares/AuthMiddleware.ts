import { Response, NextFunction } from "express";
import { AuthService } from "@services/auth/AuthService";
import { RequestWithUser } from "@interfaces/request";
import { JwtPayload, UserRole } from "@interfaces/auth";
import EncriptionUtils from "@utils/EncryptionUtils";
import { Action } from "routing-controllers";
import { Service } from "typedi";
@Service()
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

  public async authorizationChecker(
    action: Action,
    roles: UserRole[]
  ): Promise<boolean> {
    const req = action.request as any;

    const header: string | undefined =
      req.header?.("authorization") || req.headers["authorization"];

    if (!header) {
      return false;
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return false;
    }

    try {
      const utils = EncriptionUtils.getInstance();

      const payload = this.authService.verifyAccessToken(token) as JwtPayload;

      req.user = payload;

      // If there are no roles, you need to be authenticated
      if (!roles || roles.length === 0) {
        return false;
      }

      // If there are roles
      const decryptedRoleStr = utils.jwtDecryptValue(payload.role);
      const decryptedRole = Number(decryptedRoleStr) as UserRole;

      return roles.includes(decryptedRole);
    } catch (err) {
      console.error("Error verifying access token:", err);
      return false;
    }
  }

  public async currentUserChecker(
    action: Action
  ): Promise<JwtPayload | undefined> {
    return action.request.user as JwtPayload | undefined;
  }

  private toUserRole(value: unknown): UserRole | null {
    if (typeof value !== "number" && typeof value !== "string") return null;

    const num =
      typeof value === "number" ? value : Number.parseInt(value as string, 10);

    return num === UserRole.USER ||
      num === UserRole.ADMIN ||
      num === UserRole.SUPER_ADMIN
      ? (num as UserRole)
      : null;
  }
}
