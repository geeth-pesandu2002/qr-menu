import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import { verifyToken, requireRole, errorResponse } from "@/lib/middleware/auth";
import { getRestaurantSettings, updateRestaurantSettings } from "@/lib/db-service";

export async function GET() {
  try {
    const settings = await getRestaurantSettings();
    return NextResponse.json(
      { success: true, data: settings, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    const body = await request.json();
    const updated = await updateRestaurantSettings(body);

    return NextResponse.json(
      { success: true, data: updated, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
