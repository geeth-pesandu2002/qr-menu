import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  requireRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import {
  getTableById,
  updateTable,
  deleteTable,
  generateQRToken,
} from "@/lib/db-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const table = await getTableById(id);
    if (!table) {
      return NextResponse.json(
        { success: false, error: "Table not found", timestamp: Date.now() },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: table, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      throw new AuthError("Authorization required", 401);
    }

    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    const body = await request.json();
    const table = await updateTable(id, body);

    return NextResponse.json(
      { success: true, data: table, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      throw new AuthError("Authorization required", 401);
    }

    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    await deleteTable(id);

    return NextResponse.json(
      { success: true, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}