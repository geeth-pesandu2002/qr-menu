import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    console.log("≡ƒƒó GET /api/categories called");
    const { getCategories } = await import("@/lib/db-service");
    const categories = await getCategories();
    console.log("≡ƒƒó Categories retrieved:", categories?.length || 0);
    return NextResponse.json(
      { success: true, data: categories, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    console.error("≡ƒö┤ Error in GET /api/categories:", error);
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
    console.log("≡ƒƒó POST /api/categories called");
    const authHeader = request.headers.get("Authorization");
    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    const body = await request.json();
    const { createCategory } = await import("@/lib/db-service");
    const category = await createCategory(body, token.uid);

    return NextResponse.json(
      { success: true, data: category, timestamp: Date.now() },
      { status: 201 }
    );
  } catch (error) {
    console.error("≡ƒö┤ Error in POST /api/categories:", error);
    const { errorResponse } = await import("@/lib/middleware/auth");
    return errorResponse(error);
  }
}