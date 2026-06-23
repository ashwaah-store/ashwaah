import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons, homepageCategories } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

// GET all coupons
export async function GET(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await db
      .select()
      .from(coupons)
      .orderBy(desc(coupons.id));

    // Fetch categories from homepage_categories table (Category Settings)
    const homeCats = await db
      .select({ name: homepageCategories.name })
      .from(homepageCategories);

    const categoriesSet = new Set<string>();

    homeCats.forEach((c) => {
      if (c.name) {
        const trimmed = c.name.trim();
        if (trimmed) categoriesSet.add(trimmed);
      }
    });

    // Ensure basic defaults exist if empty
    if (categoriesSet.size === 0) {
      categoriesSet.add("Men");
      categoriesSet.add("Women");
      categoriesSet.add("Ethnic Wear");
    }

    const categories = Array.from(categoriesSet).sort();

    return NextResponse.json({ success: true, data, categories });
  } catch (error: any) {
    console.error("Fetch Coupons Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST a new coupon
export async function POST(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      cutoffPrice,
      targetType,
      targetValue,
      isActive,
      isVisible,
      expiresAt
    } = body;

    if (!code || !description || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { success: false, error: "Code, Description, Discount Type and Value are required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Check unique code
    const existing = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, cleanCode))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "A coupon with this code already exists." },
        { status: 400 }
      );
    }

    const result = await db
      .insert(coupons)
      .values({
        code: cleanCode,
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minPurchaseAmount: minPurchaseAmount !== undefined ? Number(minPurchaseAmount) : 0,
        cutoffPrice: cutoffPrice ? Number(cutoffPrice) : null,
        targetType: targetType || "all",
        targetValue: targetValue ? targetValue.trim() : null,
        isActive: isActive !== undefined ? !!isActive : true,
        isVisible: isVisible !== undefined ? !!isVisible : true,
        expiresAt: expiresAt || null,
      })
      .returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error("Create Coupon Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}

// PUT (update) a coupon
export async function PUT(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      code,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      cutoffPrice,
      targetType,
      targetValue,
      isActive,
      isVisible,
      expiresAt
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (code !== undefined) {
      const cleanCode = code.trim().toUpperCase();
      // Check if duplicate code exists on another coupon
      const duplicate = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, cleanCode))
        .limit(1);
      if (duplicate.length > 0 && duplicate[0].id !== id) {
        return NextResponse.json(
          { success: false, error: "Another coupon with this code already exists." },
          { status: 400 }
        );
      }
      updates.code = cleanCode;
    }
    if (description !== undefined) updates.description = description.trim();
    if (discountType !== undefined) updates.discountType = discountType;
    if (discountValue !== undefined) updates.discountValue = Number(discountValue);
    if (minPurchaseAmount !== undefined) updates.minPurchaseAmount = Number(minPurchaseAmount);
    if (cutoffPrice !== undefined) updates.cutoffPrice = cutoffPrice ? Number(cutoffPrice) : null;
    if (targetType !== undefined) updates.targetType = targetType;
    if (targetValue !== undefined) updates.targetValue = targetValue ? targetValue.trim() : null;
    if (isActive !== undefined) updates.isActive = !!isActive;
    if (isVisible !== undefined) updates.isVisible = !!isVisible;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt || null;

    const result = await db
      .update(coupons)
      .set(updates)
      .where(eq(coupons.id, id))
      .returning();

    if (result.length > 0) {
      return NextResponse.json({ success: true, data: result[0] });
    }
    return NextResponse.json(
      { success: false, error: "Coupon not found" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Update Coupon Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE a coupon
export async function DELETE(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    await db.delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Coupon Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
