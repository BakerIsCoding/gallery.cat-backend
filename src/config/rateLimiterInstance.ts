import envCfg from "@config/envLoader";
import { RateLimiter } from "src/middlewares/RateLimiter";

const MAX_REQUESTS = envCfg("RATE_LIMIT_MAX");
const WINDOW_MS = envCfg("RATE_LIMIT_WINDOW_MS");
const CLEANUP_MS = envCfg("RATE_LIMIT_CLEANUP_MS");
const TRUST_PROXY = envCfg("TRUST_PROXY");

export const rateLimiter = new RateLimiter({
  maxRequests: MAX_REQUESTS,
  windowMs: WINDOW_MS,
  cleanupMs: CLEANUP_MS,
  trustProxy: TRUST_PROXY,
  loginPaths: ["/v1/auth/login"],
});
