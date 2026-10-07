// src/lib/middleware/auth.ts
// Request authentication and authorization

import { getAuth } from "firebase-admin/auth";
import { getApps } from "firebase-admin/app";
import { getAdminDb, hasFirebaseAdminCredentials } from "@/src/lib/firebase-admin";
import { UserClaims } from "@/src/lib/types";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Extract and strictly verify Firebase token from request.
 * Returns user claims with role, uid, email.
 * 
 * Rejects missing, malformed, invalid, or expired tokens with 401 Unauthorized.
 * Strictly uses real decoded Firebase custom claim for role.
 * No demo tokens or bypasses allowed.
 */
export async function verifyToken(bearerToken?: string | null): Promise<UserClaims> {
  if (!bearerToken) {
    throw new AuthError("Missing Authorization header", 401);
  }

  if (!bearerToken.startsWith("Bearer ")) {
    throw new AuthError("Malformed Authorization header. Format must be: Bearer <token>", 401);
  }

  const token = bearerToken.substring(7).trim();
  if (!token) {
    throw new AuthError("Missing token in Authorization header", 401);
  }

  // Ensure Firebase Admin app is initialized if credentials exist
  if (getApps().length === 0 && hasFirebaseAdminCredentials()) {
    getAdminDb();
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);

    // Strictly resolve custom claims (role, restaurantId)
    const role = (decodedToken.role as UserClaims["role"]) || "customer";

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role,
      restaurantId: decodedToken.restaurantId as string | undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid or expired Firebase ID token";
    throw new AuthError(`Authentication failed: ${message}`, 401);
  }
}

/**
 * Extract token from Authorization header.
 * Throws 401 if header is absent.
 */
export function extractToken(authHeader?: string | null): string {
  if (!authHeader) {
    throw new AuthError("Missing Authorization header", 401);
  }
  return authHeader;
}

/**
 * Require specific role
 */
export function requireRole(userRole: UserClaims["role"], required: UserClaims["role"]): void {
  if (userRole !== required) {
    throw new AuthError(`Requires ${required} role`, 403);
  }
}

/**
 * Require any of these roles
 */
export function requireAnyRole(userRole: UserClaims["role"], required: UserClaims["role"][]): void {
  if (!required.includes(userRole)) {
    throw new AuthError(`Requires one of: ${required.join(", ")}`, 403);
  }
}

/**
 * Format error response
 */
export function errorResponse(error: unknown, statusCode?: number) {
  if (error instanceof AuthError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: Date.now(),
      }),
      { status: error.statusCode, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    }),
    { status: statusCode || 500, headers: { "Content-Type": "application/json" } }
  );
}