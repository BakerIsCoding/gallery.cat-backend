import { UserRole } from "@interfaces/auth";
import { getUserRoleFromRequest } from "@utils/UserUtils";
import { ExpressMiddlewareInterface } from "routing-controllers";
import { Service } from "typedi";

@Service()
export class CheckUserPermissionsMiddleware
  implements ExpressMiddlewareInterface
{
  async use(req: any, res: any, next: (err?: any) => any) {
    const role = getUserRoleFromRequest(req);

    const url = req.originalUrl || "";

    if (url.includes("admin")) {
      if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ type: "error", msg: "Unauthorized" });
      }
    }

    next();
  }
}
