import crypto from "node:crypto";

/**
 * Secure token generation and hashing utility.
 * 
 * We use SHA-256 to hash tokens before storage.
 * This prevents tokens from being leaked even if the database is compromised.
 */

/**
 * Generate a random 64-character hex token (32 bytes)
 */
export function generateRandomToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Compute the SHA-256 hash of a token.
 * This is what we store in the database.
 */
export function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}
