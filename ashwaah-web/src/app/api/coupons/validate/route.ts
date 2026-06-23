import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getVerifiedPhoneFromCookie } from "@/db/auth-helper";
import { eq } from "drizzle-orm";
import { validateAndCalculateCoupon } from "@/utils/coupon";

export async function POST(req: Request) {
  try {
    const { couponCode, items } = await req.json();

    if (!couponCode) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart items are required" }, { status: 400 });
    }

    // Attempt to resolve user ID from authentication cookie
    let userId: number | null = null;
    try {
      const phoneNumber = await getVerifiedPhoneFromCookie("auth_session");
      if (phoneNumber) {
        const userRows = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
        if (userRows.length) {
          userId = userRows[0].id;
        }
      }
    } catch (e) {
      console.warn("Could not retrieve phone number for coupon validation", e);
    }

    const validationResult = await validateAndCalculateCoupon(couponCode, items, userId);

    if (!validationResult.valid) {
      return NextResponse.json({ success: false, error: validationResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      discountAmount: validationResult.discountAmount,
      coupon: validationResult.coupon,
    });
  } catch (error: any) {
    console.error("Coupon Validation API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
