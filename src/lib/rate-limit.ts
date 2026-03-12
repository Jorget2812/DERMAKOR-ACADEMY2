import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash Rate Limiting utility.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in env.
 */

// Singleton Redis instance
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Auth Limiter: 5 attempts per 15 minutes per IP
 * Used for login, password reset, and token verification.
 */
export const authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "@dermakor/auth",
});

/**
 * API Limiter: 100 requests per minute per IP
 * Used for standard API endpoints.
 */
export const apiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "@dermakor/api",
});

/**
 * Webhook Limiter: 200 requests per minute total
 * Used for high-traffic Stripe webhooks.
 */
export const webhookLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(200, "1 m"),
    analytics: true,
    prefix: "@dermakor/webhooks",
});

/**
 * Helper to get client IP from request headers
 */
export function getIP(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");

    if (forwarded) return forwarded.split(",")[0];
    if (realIp) return realIp;

    return "127.0.0.1";
}
