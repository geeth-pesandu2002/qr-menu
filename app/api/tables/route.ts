import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  requireRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import {
  getTables,
  createTable,
  generateQRToken,
} from "@/lib/db-service";

export async function GET(request: NextRequest) {
  try {
    const tables = await getTables();
    return NextResponse.json(
      { success: true, data: tables, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      throw new AuthError("Authorization required", 401);
    }

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
    return errorResponse(error);
  }
}