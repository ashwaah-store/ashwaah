import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getVerifiedPhoneFromCookie } from "@/db/auth-helper";
import { validateAndCalculateCoupon } from "@/utils/coupon";

// POST: Fetch active coupons applicable to the current cart items (only visible ones)
export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

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

    // Fetch all active and visible coupons
    const activeCoupons = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.isActive, true), eq(coupons.isVisible, true)))
      .orderBy(desc(coupons.id));

    const applicableCoupons = [];

    // Filter only valid/applicable coupons for this cart
    for (const coupon of activeCoupons) {
      const validation = await validateAndCalculateCoupon(coupon.code, items, userId);
      if (validation.valid && validation.discountAmount > 0) {
        applicableCoupons.push({
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minPurchaseAmount: coupon.minPurchaseAmount,
          cutoffPrice: coupon.cutoffPrice,
          targetType: coupon.targetType,
          targetValue: coupon.targetValue,
          discountAmount: validation.discountAmount, // Computed potential savings
        });
      }
    }

    return NextResponse.json({ success: true, data: applicableCoupons });
  } catch (error: any) {
    console.error("Filter Applicable Coupons Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load coupons" }, { status: 500 });
  }
}

// GET: Fetch all active and visible coupons (fallback)
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
      .where(and(eq(coupons.isActive, true), eq(coupons.isVisible, true)))
      .orderBy(desc(coupons.id));

    return NextResponse.json({ success: true, data: activeCoupons });
  } catch (error: any) {
    console.error("Fetch Active Coupons Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch coupons" }, { status: 500 });
  }
}
