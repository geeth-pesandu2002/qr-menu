import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import {
  verifyToken,
  errorResponse,
  AuthError,
} from "@/src/lib/middleware/auth";
import {
  getMenuItemById,
  getMenuItems,
  getTableByQRToken,
  getTableById,
  createOrder,
  getAllOrders,
  getOrdersBySessionId,
  getOrdersByTableAndStatus,
  getOrdersByDateRange,
} from "@/src/lib/db-service";
import { OrderLine, Table } from "@/src/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Session identification
    const authHeader = request.headers.get("Authorization");
    let sessionId = body.sessionId;
    let createdBy = "customer";

    if (authHeader) {
      try {
        const token = await verifyToken(authHeader);
        sessionId = sessionId || token.uid;
        createdBy = token.uid;
      } catch {
        // Continue with customer session
      }
    }

    if (!sessionId) {
      sessionId = `session_${uuidv4().substring(0, 8)}`;
    }

    const { qrToken, tableId, items, serviceChargePercent, taxPercent } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Items list is required and cannot be empty",
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    // Look up table strictly by QR token or table ID
    let table: Table | null = null;
    if (qrToken) {
      table = await getTableByQRToken(qrToken);
    }
    if (!table && tableId) {
      table = await getTableById(tableId);
    }

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          error: `Table not found for specified tableId '${tableId || ""}' or qrToken`,
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    // Validate menu items and calculate trusted prices server-side
    const orderLines: OrderLine[] = [];

    for (const item of items) {
      if (!item.itemId) {
        return NextResponse.json(
          {
            success: false,
            error: "Each order item must specify a valid itemId",
            timestamp: Date.now(),
          },
          { status: 400 }
        );
      }

      const menuItem = await getMenuItemById(item.itemId);

      if (!menuItem) {
        return NextResponse.json(
          {
            success: false,
            error: `Menu item with ID '${item.itemId}' does not exist or has been removed.`,
            timestamp: Date.now(),
          },
          { status: 400 }
        );
      }

      if (!menuItem.isAvailable) {
        return NextResponse.json(
          {
            success: false,
            error: `Item '${menuItem.name}' is currently unavailable for ordering.`,
            timestamp: Date.now(),
          },
          { status: 400 }
        );
      }

      // Resolve trusted price server-side
      let unitPrice = menuItem.price;
      let variantLabel: string | null = null;

      if (item.variantLabel && menuItem.variants && menuItem.variants.length > 0) {
        const variant = menuItem.variants.find((v) => v.label === item.variantLabel);
        if (variant) {
          unitPrice = variant.price;
          variantLabel = variant.label;
        } else {
          return NextResponse.json(
            {
              success: false,
              error: `Variant '${item.variantLabel}' is not valid for item '${menuItem.name}'`,
              timestamp: Date.now(),
            },
            { status: 400 }
          );
        }
      }

      const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
      const lineTotal = unitPrice * qty;

      orderLines.push({
        id: `${menuItem.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        itemId: menuItem.id,
        name: menuItem.name,
        variantLabel,
        unitPrice,
        qty,
        note: (item.note || "").toString().trim(),
        lineTotal,
      });
    }

    const calculatedSubtotal = orderLines.reduce((sum, line) => sum + (line.lineTotal ?? (line.unitPrice * line.qty)), 0);

    // Dynamic charges calculation
    const taxRate = typeof taxPercent === "number" ? taxPercent : 10;
    const serviceRate = typeof serviceChargePercent === "number" ? serviceChargePercent : 10;

    const calculatedTax = Math.round(calculatedSubtotal * (taxRate / 100));
    const calculatedService = Math.round(calculatedSubtotal * (serviceRate / 100));

    const newOrder = await createOrder(
      table.id,
      table.label,
      table.qrToken || qrToken || "",
      sessionId,
      orderLines,
      calculatedTax,
      calculatedService,
      createdBy
    );

    return NextResponse.json(
      {
        success: true,
        data: newOrder,
        timestamp: Date.now(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("🔴 Error in POST /api/orders:", error);
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    const tableId = request.nextUrl.searchParams.get("tableId");
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");

    // If specific session requested (diner order history)
    if (sessionId) {
      const orders = await getOrdersBySessionId(sessionId);
      return NextResponse.json(
        { success: true, data: orders, timestamp: Date.now() },
        { status: 200 }
      );
    }

    // If specific table requested
    if (tableId) {
      const orders = await getOrdersByTableAndStatus(tableId);
      return NextResponse.json(
        { success: true, data: orders, timestamp: Date.now() },
        { status: 200 }
      );
    }

    // Requiring valid authentication for viewing all orders
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: "Authorization header required to fetch restaurant order history",
          timestamp: Date.now(),
        },
        { status: 401 }
      );
    }

    const token = await verifyToken(authHeader);
    if (token.role !== "kitchen" && token.role !== "owner") {
      throw new AuthError("Requires kitchen or owner role to access all orders", 403);
    }

    if (startDate && endDate) {
      const orders = await getOrdersByDateRange(parseInt(startDate), parseInt(endDate));
      return NextResponse.json(
        { success: true, data: orders, timestamp: Date.now() },
        { status: 200 }
      );
    }

    const orders = await getAllOrders();
    return NextResponse.json(
      { success: true, data: orders, timestamp: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔴 Error in GET /api/orders:", error);
    return errorResponse(error);
  }
}