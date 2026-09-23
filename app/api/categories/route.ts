import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  requireRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import {
  getCategories,
  createCategory,
} from "@/lib/db-service";

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories();
    return NextResponse.json(
      { success: true, data: categories, timestamp: Date.now() },
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
    const category = await createCategory(body, token.uid);

    return NextResponse.json(
      { success: true, data: category, timestamp: Date.now() },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}