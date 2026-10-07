import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import {
  verifyToken,
  errorResponse,
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
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Order ID is required", timestamp: Date.now() },
        { status: 400 }
      );
    }

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found", timestamp: Date.now() },
        { status: 404 }
      );
    }

    const authHeader = request.headers.get("Authorization");
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    const tableId = request.nextUrl.searchParams.get("tableId");

    // 1. Authenticated staff/owner: allowed full access
    if (authHeader) {
      try {
        const token = await verifyToken(authHeader);
        if (token.role === "kitchen" || token.role === "owner") {
          return NextResponse.json(
            { success: true, data: order, timestamp: Date.now() },
            { status: 200 }
          );
        }

        // Authenticated customer: verify order belongs to them
        const isOwner =
          order.createdBy === token.uid ||
          order.sessionId === token.uid ||
          (sessionId && order.sessionId === sessionId.trim());
        if (!isOwner) {
          return NextResponse.json(
            { success: false, error: "Forbidden: You do not have access to this order", timestamp: Date.now() },
            { status: 403 }
          );
        }

        return NextResponse.json(
          { success: true, data: order, timestamp: Date.now() },
          { status: 200 }
        );
      } catch (authErr) {
        return errorResponse(authErr, 401);
      }
    }

    // 2. Unauthenticated diner request:
    // Anonymous diner access must require a matching sessionId query parameter.
    if (!sessionId || !sessionId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication or sessionId query parameter is required to view order details",
          timestamp: Date.now(),
        },
        { status: 401 }
      );
    }

    if (order.sessionId !== sessionId.trim()) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Order does not belong to this session", timestamp: Date.now() },
        { status: 403 }
      );
    }

    // Additional optional filter by tableId if supplied
    if (tableId && order.tableId !== tableId.trim()) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Order does not belong to this table", timestamp: Date.now() },
        { status: 403 }
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
      return NextResponse.json(
        { success: false, error: "Authentication required to update order status", timestamp: Date.now() },
        { status: 401 }
      );
    }

    const token = await verifyToken(authHeader);
    if (token.role !== "kitchen" && token.role !== "owner") {
      return NextResponse.json(
        { success: false, error: "Requires kitchen or owner role", timestamp: Date.now() },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.status) {
      return NextResponse.json(
        { success: false, error: "Status is required", timestamp: Date.now() },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(id, body.status, token.uid);

    return NextResponse.json(
      { success: true, data: order, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}