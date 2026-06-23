import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons, users, orders, products, productVariations } from "@/db/schema";
import { eq, and, ne, inArray, desc } from "drizzle-orm";
import { getVerifiedPhoneFromCookie } from "@/db/auth-helper";
import { validateAndCalculateCoupon } from "@/utils/coupon";

// POST: Fetch active coupons and return applicability status + error messages for current cart
export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    // Resolve user ID if logged in
    let userId: number | null = null;
    try {
      const phoneNumber = await getVerifiedPhoneFromCookie("auth_session");
      if (phoneNumber) {
        const userRows = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
        if (userRows.length) {
          userId = userRows[0].id;
        }
      }
    } catch {}

    // Fetch all active coupons
    const activeCoupons = await db
      .select()
      .from(coupons)
      .where(eq(coupons.isActive, true))
      .orderBy(desc(coupons.id));

    // Pre-fetch optimizations to avoid N+1 query overhead/timeouts
    let existingOrdersCount: number | undefined = undefined;
    if (userId) {
      const existingOrders = await db
        .select()
        .from(orders)
        .where(and(eq(orders.userId, userId), ne(orders.status, "cancelled")));
      existingOrdersCount = existingOrders.length;
    }

    const productMap = new Map<number, string>();
    let variationRows: any[] = [];

    if (items && items.length > 0) {
      const productIds = Array.from(new Set(items.map((i: any) => Number(i.productId)))) as number[];
      
      const productRows = await db
        .select({ id: products.id, category: products.category })
        .from(products)
        .where(inArray(products.id, productIds));

      productRows.forEach((p) => {
        if (p.category) {
          productMap.set(p.id, p.category.toLowerCase().trim());
        }
      });

      variationRows = await db
        .select({ id: productVariations.id, productId: productVariations.productId, sku: productVariations.sku })
        .from(productVariations)
        .where(inArray(productVariations.productId, productIds));
    }

    const couponsList = [];

    // Evaluate all active coupons
    for (const coupon of activeCoupons) {
      const validation = await validateAndCalculateCoupon(coupon, items || [], userId, {
        existingOrdersCount,
        productMap,
        variationRows,
      });
      couponsList.push({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount,
        cutoffPrice: coupon.cutoffPrice,
        targetType: coupon.targetType,
        targetValue: coupon.targetValue,
        applicable: validation.valid && validation.discountAmount > 0,
        discountAmount: validation.valid ? validation.discountAmount : 0,
        error: !validation.valid ? validation.error : (validation.discountAmount === 0 ? "Coupon discount is ₹0 for these items." : null),
      });
    }

    return NextResponse.json({ success: true, data: couponsList });
  } catch (error: any) {
    console.error("Filter Applicable Coupons Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load coupons" }, { status: 500 });
  }
}

// GET: Fetch all active coupons (fallback)
export async function GET() {
  try {
    const activeCoupons = await db
      .select({
        id: coupons.id,
        code: coupons.code,
        description: coupons.description,
        discountType: coupons.discountType,
        discountValue: coupons.discountValue,
        minPurchaseAmount: coupons.minPurchaseAmount,
        cutoffPrice: coupons.cutoffPrice,
        targetType: coupons.targetType,
        targetValue: coupons.targetValue,
      })
      .from(coupons)
      .where(eq(coupons.isActive, true))
      .orderBy(desc(coupons.id));

    return NextResponse.json({ success: true, data: activeCoupons });
  } catch (error: any) {
    console.error("Fetch Active Coupons Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch coupons" }, { status: 500 });
  }
}
