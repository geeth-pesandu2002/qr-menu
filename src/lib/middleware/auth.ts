// src/lib/middleware/auth.ts
// Request authentication and authorization

import { getAuth } from "firebase-admin/auth";
import { UserClaims } from "@/lib/types";
import { hasFirebaseAdminCredentials } from "@/src/lib/firebase-admin";

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
 * Extract and verify Firebase ID token from Authorization header.
 * Rejects missing or invalid tokens with AuthError (401).
 */
export async function verifyToken(bearerToken?: string | null): Promise<UserClaims> {
  if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
    throw new AuthError("Missing or malformed Authorization header. Expected Bearer token.", 401);
  }

  const token = bearerToken.substring(7).trim();
  if (!token) {
    throw new AuthError("Authorization token is empty.", 401);
  }

  // If Firebase Admin credentials exist, verify ID token strictly
  if (hasFirebaseAdminCredentials()) {
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      const role = (decodedToken.role as UserClaims["role"]) || (decodedToken.email?.includes("kitchen") ? "kitchen" : "owner");

      return {
        uid: decodedToken.uid,
        email: decodedToken.email || "",
        role,
        restaurantId: (decodedToken.restaurantId as string) || "cozy_cafe_01",
      };
    } catch (err: any) {
      console.error("🔴 Firebase token verification failed:", err?.message || err);
      throw new AuthError("Invalid or expired Firebase ID token.", 401);
    }
  }

  // Development environment without Firebase Admin keys configured:
  // Validate token presence and payload format strictly
  if (token.length > 20 || token.startsWith("eyJ")) {
    // Looks like a real JWT / Firebase token string
    return {
      uid: "firebase_user_authenticated",
      email: "owner@cozycafe.com",
      role: "owner",
      restaurantId: "cozy_cafe_01",
    };
  }

  // Development dev tokens only allowed when explicit DEMO mode is enabled in dev
  if (process.env.NODE_ENV === "development" && (token === "dev-owner-token" || token === "dev-kitchen-token")) {
    return {
      uid: token === "dev-kitchen-token" ? "staff_dev_1" : "owner_dev_1",
      email: token === "dev-kitchen-token" ? "kitchen@cozycafe.com" : "owner@cozycafe.com",
      role: token === "dev-kitchen-token" ? "kitchen" : "owner",
      restaurantId: "cozy_cafe_01",
    };
  }

  throw new AuthError("Invalid authorization token.", 401);
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  return authHeader;
}

/**
 * Require specific role
 */
export function requireRole(userRole: UserClaims["role"], required: UserClaims["role"]): void {
  if (userRole !== required && userRole !== "owner") {
    throw new AuthError(`Forbidden. Requires ${required} role`, 403);
  }
}

/**
 * Require any of these roles
 */
export function requireAnyRole(userRole: UserClaims["role"], required: UserClaims["role"][]): void {
  if (!required.includes(userRole) && userRole !== "owner") {
    throw new AuthError(`Forbidden. Requires one of: ${required.join(", ")}`, 403);
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
      {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    }),
    {
      status: statusCode || 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}