import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    console.log("🟢 GET /api/menu-items called");
    const { getMenuItems } = await import("@/lib/db-service");
    const items = await getMenuItems();
    console.log("🟢 Items retrieved:", items?.length || 0);
    return NextResponse.json(
      { success: true, data: items, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔴 Error in GET /api/menu-items:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { verifyToken, requireRole, errorResponse, AuthError } = await import(
      "@/lib/middleware/auth"
    );
    console.log("🟢 POST /api/menu-items called");
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      throw new AuthError("Authorization required", 401);
    }

    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    const body = await request.json();
    const { createMenuItem } = await import("@/lib/db-service");
    const item = await createMenuItem(body, token.uid);

    return NextResponse.json(
      { success: true, data: item, timestamp: Date.now()  },
      { status: 201 }
    );
  } catch (error) {
    console.error("🔴 Error in POST /api/menu-items:", error);
    const { errorResponse } = await import("@/lib/middleware/auth");
    return errorResponse(error);
  } 
}