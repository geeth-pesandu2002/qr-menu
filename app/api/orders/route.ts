import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import {
  verifyToken,
  errorResponse,
} from "@/lib/middleware/auth";
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
} from "@/lib/db-service";
import { OrderLine, Table } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // For customers: optional auth, or use anonymous session
    const authHeader = request.headers.get("Authorization");
    let sessionId = body.sessionId;
    let createdBy = "anonymous";

    if (authHeader) {
      try {
        const token = await verifyToken(authHeader);
        sessionId = sessionId || token.uid;
        createdBy = token.uid;
      } catch {
        // Continue with anonymous customer session
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

    // Look up table by QR token or table ID
    let table: Table | null = null;
    if (qrToken) {
      table = await getTableByQRToken(qrToken);
    }
    if (!table && tableId) {
      table = await getTableById(tableId);
    }

    // Fallback if table not explicitly stored
    if (!table) {
      const cleanId = (tableId || qrToken || "05").toString();
      table = {
        id: cleanId,
        label: `Table ${cleanId.padStart(2, "0")}`,
        isActive: true,
      };
    }

    // Validate and build order lines
    const orderLines: OrderLine[] = [];
    let subtotal = 0;

    for (const item of items) {
      let menuItem = await getMenuItemById(item.itemId);

      if (!menuItem) {
        const allItems = await getMenuItems();
        menuItem =
          allItems.find(
            (m) =>
              m.id === item.itemId ||
              (item.name && m.name.toLowerCase() === item.name.toLowerCase())
          ) || null;
      }

      if (!menuItem) {
        if (item.name && item.unitPrice) {
          menuItem = {
            id: item.itemId,
            name: item.name,
            description: "",
            price: Number(item.unitPrice),
            categoryId: "general",
            imageUrl: item.imageUrl || null,
            isAvailable: true,
            sortOrder: 99,
            variants: [],
          };
        } else {
          return NextResponse.json(
            {
              success: false,
              error: `Item ${item.itemId} not found`,
              timestamp: Date.now(),
            },
            { status: 404 }
          );
        }
      }

      // Determine unit price (with or without variant)
      let unitPrice = menuItem.price;
      let variantLabel: string | null = null;

      if (item.variantLabel && menuItem.variants && menuItem.variants.length > 0) {
        const variant = menuItem.variants.find(
          (v) => v.label === item.variantLabel
        );
        if (variant) {
          unitPrice = variant.price;
          variantLabel = variant.label;
        }
      } else if (item.unitPrice) {
        unitPrice = Number(item.unitPrice);
        variantLabel = item.variantLabel || null;
      }

      const qty = Number(item.qty) || 1;
      const lineTotal = unitPrice * qty;

      orderLines.push({
        id: `${menuItem.id}_${Date.now()}`,
        itemId: menuItem.id,
        name: menuItem.name,
        variantLabel,
        unitPrice,
        qty,
        note: item.note || "",
        imageUrl: item.imageUrl || menuItem.imageUrl || null,
        lineTotal,
      });

      subtotal += lineTotal;
    }

    // Calculate tax and service charge
    const tax = Math.round((subtotal * (taxPercent ?? 10)) / 100);
    const serviceCharge = Math.round(
      (subtotal * (serviceChargePercent ?? 5)) / 100
    );

    // Create order in store
    const order = await createOrder(
      table.id,
      table.label,
      table.qrToken || qrToken || "",
      sessionId,
      orderLines,
      tax,
      serviceCharge,
      createdBy
    );

    return NextResponse.json(
      {
        success: true,
        data: order,
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
        {
          success: true,
          data: orders,
          timestamp: Date.now(),
        },
        { status: 200 }
      );
    }

    // If specific table requested
    if (tableId) {
      const orders = await getOrdersByTableAndStatus(tableId);
      return NextResponse.json(
        {
          success: true,
          data: orders,
          timestamp: Date.now(),
        },
        { status: 200 }
      );
    }

    // If authenticated staff/owner
    if (authHeader) {
      try {
        const token = await verifyToken(authHeader);
        if (token.role === "kitchen" || token.role === "owner") {
          if (startDate && endDate) {
            const orders = await getOrdersByDateRange(
              parseInt(startDate),
              parseInt(endDate)
            );
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
        }
      } catch {
        // Fall through to general orders
      }
    }

    // Default: Return all active orders (for kitchen dashboard / demo portal)
    const orders = await getAllOrders();
    return NextResponse.json(
      {
        success: true,
        data: orders,
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔴 Error in GET /api/orders:", error);
    return errorResponse(error);
  }
}