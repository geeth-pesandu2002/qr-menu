import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    console.log("≡ƒƒó GET /api/tables called");
    const { getTables } = await import("@/lib/db-service");
    const tables = await getTables();
    console.log("≡ƒƒó Tables retrieved:", tables?.length || 0);
    return NextResponse.json(
      { success: true, data: tables, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    console.error("≡ƒö┤ Error in GET /api/tables:", error);
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
    const { createTable, generateQRToken } = await import("@/lib/db-service");
    console.log("≡ƒƒó POST /api/tables called");
    const authHeader = request.headers.get("Authorization");
    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    const body = await request.json();
    const qrToken = generateQRToken();
    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://qr-menu.vercel.app"}?table=${qrToken}`;

    const table = await createTable(
      {
        ...body,
        qrToken,
        qrUrl,
      },
      token.uid
    );

    return NextResponse.json(
      { success: true, data: table, timestamp: Date.now() },
      { status: 201 }
    );
  } catch (error) {
    console.error("≡ƒö┤ Error in POST /api/tables:", error);
    const { errorResponse } = await import("@/lib/middleware/auth");
    return errorResponse(error);
  }
}