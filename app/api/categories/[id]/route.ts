import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  requireRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/lib/db-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await getCategoryById(params.id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found", timestamp: Date.now() },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: category, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      throw new AuthError("Authorization required", 401);
    }

    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    const body = await request.json();
    const category = await updateCategory(params.id, body);

    return NextResponse.json(
      { success: true, data: category, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      throw new AuthError("Authorization required", 401);
    }

    const token = await verifyToken(authHeader);
    requireRole(token.role, "owner");

    await deleteCategory(params.id);

    return NextResponse.json(
      { success: true, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}