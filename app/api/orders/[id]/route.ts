import { NextRequest, NextResponse } from "next/server";
import {
  extractToken,
  verifyToken,
  requireAnyRole,
  errorResponse,
  AuthError,
} from "@/lib/middleware/auth";
import { getOrderById, updateOrderStatus } from "@/lib/db-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await getOrderById(params.id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found", timestamp: Date.now() },
        { status: 404 }
      );
    }

    // Check permission: customer can only see their own order
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      const sessionId = request.nextUrl.searchParams.get("sessionId");
      if (!sessionId || sessionId !== order.sessionId) {
        throw new AuthError("Cannot view this order", 403);
      }
    } else {
      const token = await verifyToken(authHeader);
      if (token.role === "customer" && token.uid !== order.sessionId) {
        throw new AuthError("Cannot view this order", 403);
      }
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
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      throw new AuthError("Authorization required", 401);
    }

    const token = await verifyToken(authHeader);
    requireAnyRole(token.role, ["kitchen", "owner"]);

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "status required", timestamp: Date.now() },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(params.id, status, token.uid);

    return NextResponse.json(
      { success: true, data: order, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}