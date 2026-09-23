import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  requireAnyRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import { getDashboardStats } from "@/lib/db-service";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      throw new AuthError("Authorization required", 401);
    }

    const token = await verifyToken(authHeader);
    requireAnyRole(token.role, ["kitchen", "owner"]);

    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "startDate and endDate required (timestamps)",
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    const stats = await getDashboardStats(
      parseInt(startDate),
      parseInt(endDate)
    );

    return NextResponse.json(
      { success: true, data: stats, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}