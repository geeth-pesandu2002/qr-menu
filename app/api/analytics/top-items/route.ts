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
    const token = await verifyToken(authHeader);
    requireAnyRole(token.role, ["kitchen", "owner"]);

    const startDateParam = request.nextUrl.searchParams.get("startDate");
    const endDateParam = request.nextUrl.searchParams.get("endDate");
    const limit = request.nextUrl.searchParams.get("limit") || "10";

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startDate = startDateParam ? parseInt(startDateParam) : startOfDay;
    const endDate = endDateParam ? parseInt(endDateParam) : Date.now() + 86400000;

    const topItems = await getTopItems(
      startDate,
      endDate,
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