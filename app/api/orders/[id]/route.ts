import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  requireRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import {
  getOrderById,
  updateOrderStatus,
} from "@/lib/db-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found", timestamp: Date.now() },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: order, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
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
    requireRole(token.role, "kitchen");

    const body = await request.json();
    const order = await updateOrderStatus(id, body.status, token.uid);

    return NextResponse.json(
      { success: true, data: order, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}