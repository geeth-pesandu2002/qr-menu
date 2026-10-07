import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  requireRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import { getTableById } from "@/lib/db-service";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    const tableId = request.nextUrl.searchParams.get("tableId");
    if (!tableId) {
      return NextResponse.json(
        {
          success: false,
          error: "tableId required",
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    const table = await getTableById(tableId);
    if (!table) {
      return NextResponse.json(
        {
          success: false,
          error: "Table not found",
          timestamp: Date.now(),
        },
        { status: 404 }
      );
    }

    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(table.qrUrl || "");

    return NextResponse.json(
      {
        success: true,
        data: {
          tableId: table.id,
          tableLabel: table.label,
          qrToken: table.qrToken,
          qrUrl: table.qrUrl,
          dataUrl, // base64 encoded image
        },
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}