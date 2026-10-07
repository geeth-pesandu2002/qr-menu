import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import {
  verifyToken,
  errorResponse,
} from "@/lib/middleware/auth";
import {
  getMenuItemById,
  getTableByQRToken,
  getTableById,
  createOrder,
  getAllOrders,
  getOrdersBySessionId,
  getOrdersByTableAndStatus,
  getOrdersByDateRange,
  getRestaurantSettings,
  DEFAULT_SETTINGS,
} from "@/lib/db-service";
import { OrderLine, Table } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// Business limit for maximum quantity per item line
const MAX_ITEM_QUANTITY = 50;

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

    if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
      sessionId = `session_${uuidv4().substring(0, 8)}`;
    } else {
      sessionId = sessionId.trim();
    }

    const { qrToken, tableId, items } = body;

    // 1. Table validation
    if (!tableId && !qrToken) {
      return NextResponse.json(
        {
          success: false,
          error: "tableId or qrToken is required",
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    let table: Table | null = null;
    if (tableId) {
      table = await getTableById(String(tableId).trim());
    }
    if (!table && qrToken) {
      table = await getTableByQRToken(String(qrToken).trim());
    }

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          error: `Table '${tableId || qrToken}' not found`,
          timestamp: Date.now(),
        },
        { status: 404 }
      );
    }

    if (table.isActive !== true) {
      return NextResponse.json(
        {
          success: false,
          error: `Table '${table.label || table.id}' is not active`,
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    // 2. Validate items list
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

    const orderLines: OrderLine[] = [];
    let subtotal = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item || typeof item !== "object") {
        return NextResponse.json(
          {
            success: false,
            error: `Item at index ${i} is invalid`,
            timestamp: Date.now(),
          },
          { status: 400 }
        );
      }

      const itemId = item.itemId;
      if (!itemId || typeof itemId !== "string" || !itemId.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: `Item at index ${i} is missing a valid itemId`,
            timestamp: Date.now(),
          },
          { status: 400 }
        );
      }

      // Quantity validation
      const rawQty = item.qty;
      if (
        typeof rawQty !== "number" ||
        isNaN(rawQty) ||
        !Number.isInteger(rawQty) ||
        rawQty <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Quantity for item '${itemId}' must be a positive integer`,
            timestamp: Date.now(),
          },
          { status: 400 }
        );
      }

      if (rawQty > MAX_ITEM_QUANTITY) {
        return NextResponse.json(
          {
            success: false,
            error: `Quantity ${rawQty} for item '${itemId}' exceeds maximum allowed limit of ${MAX_ITEM_QUANTITY}`,
            timestamp: Date.now(),
          },
          { status: 400 }
        );
      }

      const qty = rawQty;

      // Resolve real menu item from Firestore
      const menuItem = await getMenuItemById(itemId.trim());
      if (!menuItem) {
        return NextResponse.json(
          {
            success: false,
            error: `Menu item '${itemId}' not found in database`,
            timestamp: Date.now(),
          },
          { status: 404 }
        );
      }

      if (!menuItem.isAvailable) {
        return NextResponse.json(
          {
            success: false,
            error: `Menu item '${menuItem.name}' is currently unavailable`,
            timestamp: Date.now(),
          },
          { status: 400 }
        );
      }

      // Price validation: strictly resolve trusted price and variant from database
      let unitPrice: number = menuItem.price;
      let variantLabel: string | null = null;

      if (item.variantLabel && typeof item.variantLabel === "string" && item.variantLabel.trim()) {
        const reqVariantLabel = item.variantLabel.trim();
        const matchedVariant = menuItem.variants?.find(
          (v) => v.label.toLowerCase() === reqVariantLabel.toLowerCase()
        );
        if (!matchedVariant) {
          return NextResponse.json(
            {
              success: false,
              error: `Variant '${reqVariantLabel}' not found for item '${menuItem.name}'`,
              timestamp: Date.now(),
            },
            { status: 400 }
          );
        }
        unitPrice = matchedVariant.price;
        variantLabel = matchedVariant.label;
      }

      if (typeof unitPrice !== "number" || isNaN(unitPrice) || unitPrice < 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid price configured for menu item '${menuItem.name}'`,
            timestamp: Date.now(),
          },
          { status: 500 }
        );
      }

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      const note = typeof item.note === "string" ? item.note.trim().slice(0, 500) : "";

      orderLines.push({
        id: `${menuItem.id}_${Date.now()}_${i}`,
        itemId: menuItem.id,
        name: menuItem.name,       // Trusted server name
        variantLabel,              // Trusted variant label
        unitPrice,                 // Trusted server price
        qty,                       // Validated integer qty
        note,
        imageUrl: menuItem.imageUrl || null, // Trusted server image
        lineTotal,                 // Authoritative line total
      });
    }

    // Server-side tax & service charge calculation using trusted restaurant settings
    const settings = await getRestaurantSettings().catch(() => DEFAULT_SETTINGS);
    const serviceChargePercent =
      typeof settings?.serviceCharge === "number" ? settings.serviceCharge : 5;
    const taxPercent =
      typeof settings?.taxRate === "number" ? settings.taxRate : 10;

    const tax = Math.round((subtotal * taxPercent) / 100);
    const serviceCharge = Math.round((subtotal * serviceChargePercent) / 100);

    // Create order in store
    const order = await createOrder(
      table.id,
      table.label,
      table.qrToken || (typeof qrToken === "string" ? qrToken : ""),
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

    // 1. If Authorization header is provided, strictly verify it
    if (authHeader) {
      try {
        const token = await verifyToken(authHeader);

        // Staff / Owner roles have full access
        if (token.role === "kitchen" || token.role === "owner") {
          if (startDate && endDate) {
            const orders = await getOrdersByDateRange(
              parseInt(startDate, 10),
              parseInt(endDate, 10)
            );
            return NextResponse.json(
              { success: true, data: orders, timestamp: Date.now() },
              { status: 200 }
            );
          }
          if (tableId) {
            const orders = await getOrdersByTableAndStatus(tableId);
            return NextResponse.json(
              { success: true, data: orders, timestamp: Date.now() },
              { status: 200 }
            );
          }
          if (sessionId) {
            const orders = await getOrdersBySessionId(sessionId);
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

        // Authenticated customer role - scoped to their session/UID
        const effectiveSessionId = sessionId || token.uid;
        const orders = await getOrdersBySessionId(effectiveSessionId);
        return NextResponse.json(
          { success: true, data: orders, timestamp: Date.now() },
          { status: 200 }
        );
      } catch (authErr) {
        // If an explicit Authorization header was provided but invalid, reject immediately
        return errorResponse(authErr, 401);
      }
    }

    // 2. Unauthenticated / Anonymous diner requests:
    // Anonymous/customer requests must require sessionId.
    // tableId may be used only as an additional filter after valid customer/session scoping,
    // not as the sole authorization scope.
    if (!sessionId || !sessionId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication or valid sessionId query parameter is required to view orders.",
          timestamp: Date.now(),
        },
        { status: 401 }
      );
    }

    let orders = await getOrdersBySessionId(sessionId.trim());
    if (tableId) {
      orders = orders.filter((o) => o.tableId === tableId.trim());
    }

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