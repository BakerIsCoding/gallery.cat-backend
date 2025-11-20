import type { Request, Response, NextFunction } from "express";

export interface RateLimiterConfig {
  maxRequests: number; // RATE_LIMIT_MAX
  windowMs: number; // RATE_LIMIT_WINDOW_MS
  cleanupMs: number; // RATE_LIMIT_CLEANUP_MS
  loginPaths: string[]; // Rutas de login (por IP si no hay token)
  trustProxy: boolean; // Si usas reverse proxy
}

export interface TokenInfo {
  count: number;
  lastRequest: number;
  ips: string[]; // IPs únicas para este token
}

export class RateLimiter {
  private readonly cfg: RateLimiterConfig;
  private readonly store: Map<string, TokenInfo>;
  private cleanupTimer?: NodeJS.Timer;

  constructor(cfg: RateLimiterConfig) {
    this.cfg = {
      ...cfg,
    };
    this.store = new Map<string, TokenInfo>();
    this.startCleanup();
  }

  public middleware = (req: Request, res: Response, next: NextFunction) => {
    // If the app is behind a proxy and trustProxy is enabled
    if (this.cfg.trustProxy && typeof req.app?.set === "function") {
      req.app.set("trust proxy", true);
    }

    const token = this.extractToken(req);
    const now = Date.now();

    // If there is no token and the route is a login route, limit by IP
    if (!token) {
      if (this.isLoginRoute(req)) {
        const ipKey = `ip:${this.getClientIp(req)}`;
        if (this.isLimited(ipKey, now)) {
          return res
            .status(429)
            .json({ type: "error", msg: "Too Many Requests" });
        }
      }
      return next();
    }

    // If there is a token, limit by token
    const key = `token:${token}`;
    const limited = this.isLimited(key, now, this.getClientIp(req));

    if (limited) {
      return res.status(429).json({ type: "error", msg: "Too Many Requests" });
    }

    return next();
  };

  private isLimited(key: string, now: number, ipToAppend?: string): boolean {
    const info = this.store.get(key);

    // If there is no info, it means this is the first request
    if (!info) {
      this.store.set(key, {
        count: 1,
        lastRequest: now,
        ips: ipToAppend ? [ipToAppend] : [],
      });

      return false;
    }

    // If the time window has passed, reset the counter
    if (now - info.lastRequest > this.cfg.windowMs) {
      info.count = 1;
      info.lastRequest = now;

      // Add unique IP if applicable
      if (ipToAppend) {
        this.addUniqueIp(info.ips, ipToAppend);
      }

      this.store.set(key, info);
      return false;
    }

    // If it is within the time window, increment the counter
    info.count++;
    info.lastRequest = now;

    if (ipToAppend) {
      this.addUniqueIp(info.ips, ipToAppend);
    }

    this.store.set(key, info);

    return info.count > this.cfg.maxRequests;
  }

  private addUniqueIp(arr: string[], ip: string) {
    if (ip && !arr.includes(ip)) arr.push(ip);
  }

  private extractToken(req: Request): string | null {
    const auth = req.header("authorization");

    if (auth && auth.startsWith("Bearer ")) {
      return auth.slice(7).trim();
    }

    return null;
  }

  private isLoginRoute(req: Request): boolean {
    const path = (req.path || "").toLowerCase();

    if (req.method !== "POST") {
      return false;
    }

    return this.cfg.loginPaths!.some(
      (loginPath) => loginPath.toLowerCase() === path
    );
  }

  private getClientIp(req: Request): string {
    // requires app.set('trust proxy', true) if behind a proxy
    const ip = req.ip || req.socket.remoteAddress;
    return ip ? ip.toString() : "";
  }

  // Cleanup old entries
  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();

      for (const [key, data] of this.store) {
        if (now - data.lastRequest > this.cfg.windowMs * 2) {
          this.store.delete(key);
        }
      }
    }, this.cfg.cleanupMs);
    // Prevent keeping the process alive just because of the interval
    (this.cleanupTimer as any)?.unref?.();
  }
}
