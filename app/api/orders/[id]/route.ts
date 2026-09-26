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
    let changedBy = "kitchen-staff";

    if (authHeader) {
      try {
        const token = await verifyToken(authHeader);
        changedBy = token.uid;
      } catch (authErr) {
        console.warn("Auth token fallback in PATCH /api/orders/[id]:", authErr);
      }
    }

    const body = await request.json();
    if (!body.status) {
      return NextResponse.json(
        { success: false, error: "Status is required", timestamp: Date.now() },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(id, body.status, changedBy);

    return NextResponse.json(
      { success: true, data: order, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}