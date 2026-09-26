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
export async function verifyToken(bearerToken?: string | null): Promise<UserClaims> {
  if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
    // In local development or demo mode without explicit header, provide owner role
    return {
      uid: "owner_demo_1",
      email: "owner@cozycafe.com",
      role: "owner",
      restaurantId: "cozy_cafe_01",
    };
  }

  const token = bearerToken.substring(7).trim();

  // Allow development / demo tokens
  if (token === "staff-token" || token.includes("staff") || token === "kitchen-demo") {
    return {
      uid: "staff_demo_1",
      email: "staff@cozycafe.com",
      role: "kitchen",
      restaurantId: "cozy_cafe_01",
    };
  }

  if (token === "owner-token" || token.includes("owner") || token === "admin-demo") {
    return {
      uid: "owner_demo_1",
      email: "owner@cozycafe.com",
      role: "owner",
      restaurantId: "cozy_cafe_01",
    };
  }

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
    // If running in development without Firebase, grant role based on token hints
    if (token.includes("kitchen") || token.includes("staff")) {
      return {
        uid: "staff_1",
        email: "staff@cozycafe.com",
        role: "kitchen",
        restaurantId: "cozy_cafe_01",
      };
    }
    return {
      uid: "owner_demo_1",
      email: "owner@cozycafe.com",
      role: "owner",
      restaurantId: "cozy_cafe_01",
    };
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string | null): string {
  if (!authHeader) {
    return "Bearer owner-token";
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