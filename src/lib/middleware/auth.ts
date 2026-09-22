// src/lib/middleware/auth.ts
// Request authentication and authorization

import { getAuth } from "firebase-admin/auth";
import { UserClaims } from "@/lib/types";

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
 * Extract and verify Firebase token from request
 * Returns user claims with role, uid, email
 */
export async function verifyToken(bearerToken: string): Promise<UserClaims> {
  if (!bearerToken.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid Authorization header", 401);
  }

  const token = bearerToken.substring(7);

  try {
    const decodedToken = await getAuth().verifyIdToken(token);

    // Check for custom claims (role, restaurantId)
    const role = (decodedToken.role as UserClaims["role"]) || "customer";

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role,
      restaurantId: decodedToken.restaurantId as string,
    };
  } catch {
    throw new AuthError("Invalid or expired token", 401);
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string): string {
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
      { status: error.statusCode }
    );
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    }),
    { status: statusCode || 500 }
  );
}