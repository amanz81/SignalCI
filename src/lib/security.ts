import { randomBytes } from "crypto";

/**
 * Generate a secure 32-byte random hex string for webhook tokens
 * Format: 64-character hex string (e.g., "a1b2c3d4e5f6...")
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate a webhook URL with secure token pattern
 * Format: /api/webhook/v1/{token}
 */
export function generateWebhookUrl(token: string, baseUrl?: string): string {
  const path = `/api/webhook/v1/${token}`;
  return baseUrl ? `${baseUrl}${path}` : path;
}

/**
 * Validate payload secret against pipeline secret
 * Returns true if secret matches or if pipeline has no secret set
 */
export function validatePayloadSecret(
  payload: any,
  pipelineSecret: string | null
): boolean {
  // If no secret is configured, allow the request
  if (!pipelineSecret) {
    return true;
  }

  // Check if payload contains the auth_secret field
  if (typeof payload === "object" && payload !== null) {
    return payload.auth_secret === pipelineSecret;
  }

  return false;
}

