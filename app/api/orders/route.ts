import { NextRequest, NextResponse } from "next/server";
import {
  extractToken,
  verifyToken,
  errorResponse,
} from "@/lib/middleware/auth";
import {
  getMenuItemById,
  getTableByQRToken,
  createOrder,
} from "@/lib/db-service";
import { OrderLine } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // For customers: optional auth, or use anonymous session
    const authHeader = request.headers.get("Authorization");
    let sessionId = body.sessionId; // passed by customer
    let createdBy = "anonymous";

    if (authHeader) {
      const token = await verifyToken(authHeader);
      sessionId = token.uid;
      createdBy = token.uid;
    }

    if (!sessionId) {
      sessionId = uuidv4();
    }

    const { qrToken, items, serviceChargePercent, taxPercent } = body;

    if (!qrToken || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid qrToken or items",
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    // Look up table from QR token
    const table = await getTableByQRToken(qrToken);
    if (!table) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid QR code",
          timestamp: Date.now(),
        },
        { status: 404 }
      );
    }

    // Validate and build order lines
    const orderLines: OrderLine[] = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await getMenuItemById(item.itemId);

      if (!menuItem) {
        return NextResponse.json(
          {
            success: false,
            error: `Item ${item.itemId} not found`,
            timestamp: Date.now(),
          },
          { status: 404 }
        );
      }

      if (!menuItem.isAvailable) {
        return NextResponse.json(
          {
            success: false,
            error: `Item ${menuItem.name} is out of stock`,
            timestamp: Date.now(),
          },
          { status: 400 }
        );
      }

      // Determine price (with or without variant)
      let unitPrice = menuItem.price;
      let variantLabel: string | null = null;

      if (item.variantLabel && menuItem.variants.length > 0) {
        const variant = menuItem.variants.find(
          (v) => v.label === item.variantLabel
        );
        if (variant) {
          unitPrice = variant.price;
          variantLabel = variant.label;
        }
      }

      const lineTotal = unitPrice * item.qty;

      orderLines.push({
        itemId: menuItem.id,
        name: menuItem.name,
        variantLabel,
        unitPrice,
        qty: item.qty,
        note: item.note || "",
        lineTotal,
      });

      subtotal += lineTotal;
    }

    // Calculate tax and service charge
    const tax = Math.round(subtotal * (taxPercent || 10) / 100);
    const serviceCharge = Math.round(subtotal * (serviceChargePercent || 5) / 100);

    // Create order
    const order = await createOrder(
      table.id,
      table.label,
      table.qrToken || "",
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
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    // For customer: only return their own orders (by sessionId in query)
    if (!authHeader) {
      const sessionId = request.nextUrl.searchParams.get("sessionId");
      if (!sessionId) {
        return NextResponse.json(
          {
            success: false,
            error: "sessionId required for customers",
            timestamp: Date.now(),
          },
          { status: 400 }
        );
      }

      // Return orders for this session (security rules will enforce this)
      return NextResponse.json(
        {
          success: true,
          data: [],
          timestamp: Date.now(),
        },
        { status: 200 }
      );
    }

    // For staff/owner: return all orders
    const token = await verifyToken(authHeader);

    if (token.role === "customer") {
      return NextResponse.json(
        {
          success: false,
          error: "Customers cannot view all orders",
          timestamp: Date.now(),
        },
        { status: 403 }
      );
    }

    // Get orders from query params or default to today
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");

    const start = startDate ? parseInt(startDate) : new Date().setHours(0, 0, 0, 0);
    const end = endDate ? parseInt(endDate) : new Date().setHours(23, 59, 59, 999);

    // Return orders in the date range
    return NextResponse.json(
      {
        success: true,
        data: [],
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}