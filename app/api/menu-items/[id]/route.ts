import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  requireRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import {
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from "@/lib/db-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await getMenuItemById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found", timestamp: Date.now() },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: item, timestamp: Date.now() },
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
    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    const body = await request.json();
    const item = await updateMenuItem(id, body);

    return NextResponse.json(
      { success: true, data: item, timestamp: Date.now() },
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
    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    await deleteMenuItem(id);

    return NextResponse.json(
      { success: true, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}