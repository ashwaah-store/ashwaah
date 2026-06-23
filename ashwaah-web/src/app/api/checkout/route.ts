import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { getVerifiedPhoneFromCookie } from "@/db/auth-helper";
import { eq } from "drizzle-orm";
import { validateAndCalculateCoupon } from "@/utils/coupon";

export async function POST(req: Request) {
  try {
    const { items, totalAmount, paymentMethod, shippingAddress, couponCode } = await req.json();
    const phoneNumber = await getVerifiedPhoneFromCookie("auth_session");

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    // Find user
    const userRows = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    if (!userRows.length) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    const user = userRows[0];

    // Validate Coupon securely if provided
    let discountAmount = 0;
    if (couponCode) {
      const couponValidation = await validateAndCalculateCoupon(couponCode, items, user.id);
      if (!couponValidation.valid) {
        return NextResponse.json({ success: false, error: couponValidation.error || "Invalid coupon" }, { status: 400 });
      }
      discountAmount = couponValidation.discountAmount;
    }

    // Recalculate subtotal and verify expected total
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const expectedTotal = Math.max(0, subtotal - discountAmount);

    if (Math.abs(totalAmount - expectedTotal) > 0.01) {
      return NextResponse.json({
        success: false,
        error: `Total amount mismatch. Expected: ₹${expectedTotal}, Received: ₹${totalAmount}`
      }, { status: 400 });
    }

    // Append new address to user's saved addresses
    if (shippingAddress) {
      let addresses: string[] = [];
      if (user.address) {
        try {
          addresses = JSON.parse(user.address);
          if (!Array.isArray(addresses)) addresses = [user.address];
        } catch {
          addresses = [user.address];
        }
      }
      if (!addresses.includes(shippingAddress)) {
        addresses.push(shippingAddress);
        await db.update(users)
          .set({ address: JSON.stringify(addresses) })
          .where(eq(users.id, user.id));
      }
    }

    // Create Order
    const [newOrder] = await db.insert(orders).values({
      userId: user.id,
      totalAmount: totalAmount,
      status: "pending", // Initial status after payment
      shippingAddress: shippingAddress,
      couponCode: couponCode || null,
      discountAmount: discountAmount || 0,
      createdAt: new Date().toISOString(),
    }).returning();

    // Create Order Items
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        customizations: JSON.stringify(item.customizations),
      });
    }

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

