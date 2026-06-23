import { db } from "./index";
import { coupons } from "./schema";
import { eq } from "drizzle-orm";

async function seedCoupons() {
  console.log("Seeding coupons...");

  try {
    // Clear any existing coupons with these codes
    const targetCodes = ["FIRST500", "MEGA15", "ETHNIC25"];
    for (const code of targetCodes) {
      await db.delete(coupons).where(eq(coupons.code, code));
    }

    const now = new Date().toISOString();

    // Insert coupons
    await db.insert(coupons).values([
      {
        code: "FIRST500",
        description: "FLAT ₹500 OFF - ON YOUR 1st PURCHASE ABOVE ₹1999",
        discountType: "flat",
        discountValue: 500,
        minPurchaseAmount: 1999,
        cutoffPrice: null,
        targetType: "first_order",
        targetValue: null,
        isActive: true,
        createdAt: now,
      },
      {
        code: "MEGA15",
        description: "FLAT 15% OFF - ON YOUR PURCHASE ABOVE ₹15000 (Capped at ₹20,000 purchase)",
        discountType: "percentage",
        discountValue: 15,
        minPurchaseAmount: 15000,
        cutoffPrice: 20000,
        targetType: "all",
        targetValue: null,
        isActive: true,
        createdAt: now,
      },
      {
        code: "ETHNIC25",
        description: "FLAT 25% OFF on Ethnic Wear items in cart",
        discountType: "percentage",
        discountValue: 25,
        minPurchaseAmount: 0,
        cutoffPrice: null,
        targetType: "category",
        targetValue: "Ethnic Wear, Ethnic",
        isActive: true,
        createdAt: now,
      },
    ]);

    console.log("Successfully seeded coupons in Drizzle database.");
  } catch (error: any) {
    console.error("Seeding coupons failed:", error.message || error);
  }
}

seedCoupons();
