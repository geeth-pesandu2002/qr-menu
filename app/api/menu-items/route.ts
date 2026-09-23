import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  requireRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import {
  getMenuItems,
  createMenuItem,
} from "@/lib/db-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    console.log("🟢 GET /api/menu-items called");
    const items = await getMenuItems();
    console.log("🟢 Items retrieved:", items?.length || 0);
    return NextResponse.json(
      { success: true, data: items, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔴 Error in GET /api/menu-items:", error);
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🟢 POST /api/menu-items called");
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      throw new AuthError("Authorization required", 401);
    }

    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    const body = await request.json();
    const item = await createMenuItem(body, token.uid);

    return NextResponse.json(
      { success: true, data: item, timestamp: Date.now()  },
      { status: 201 }
    );
  } catch (error) {
    console.error("🔴 Error in POST /api/menu-items:", error);
    return errorResponse(error);
  } 
}