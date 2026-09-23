import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  requireAnyRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import { getTopItems } from "@/lib/db-service";

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
    const limit = request.nextUrl.searchParams.get("limit") || "10";

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "startDate and endDate required",
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    const topItems = await getTopItems(
      parseInt(startDate),
      parseInt(endDate),
      parseInt(limit)
    );

    return NextResponse.json(
      { success: true, data: topItems, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}