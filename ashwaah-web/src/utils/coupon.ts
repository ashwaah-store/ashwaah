import { db } from "@/db";
import { coupons, orders, products, productVariations } from "@/db/schema";
import { eq, and, ne, inArray } from "drizzle-orm";

export interface CartItem {
  productId: number;
  quantity: number;
  price: number;
  size: string;
  color?: string | null;
}

export async function validateAndCalculateCoupon(
  code: string,
  items: CartItem[],
  userId?: number | null
) {
  if (!code || !items || items.length === 0) {
    return { valid: false, discountAmount: 0, error: "Invalid request parameters." };
  }

  const cleanCode = code.trim().toUpperCase();

  // 1. Fetch coupon
  const couponRows = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, cleanCode))
    .limit(1);

  if (couponRows.length === 0) {
    return { valid: false, discountAmount: 0, error: "Coupon code does not exist." };
  }

  const coupon = couponRows[0];

  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, error: "This coupon is no longer active." };
  }

  // Check Expiry Date
  if (coupon.expiresAt) {
    let expiryStr = coupon.expiresAt;
    if (expiryStr.length === 10) {
      // If it's a date-only string like YYYY-MM-DD, treat it as valid until the end of the day
      expiryStr += "T23:59:59";
    }
    const expiryDate = new Date(expiryStr);
    const currentDate = new Date();
    if (expiryDate < currentDate) {
      return { valid: false, discountAmount: 0, error: "This coupon code has expired." };
    }
  }

  // Calculate overall subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 2. Check min purchase amount
  if (subtotal < coupon.minPurchaseAmount) {
    return {
      valid: false,
      discountAmount: 0,
      error: `Minimum purchase of ₹${coupon.minPurchaseAmount} is required for this coupon.`,
    };
  }

  // 3. Check Target Type
  let qualifyingSubtotal = subtotal;

  if (coupon.targetType === "first_order") {
    if (!userId) {
      return {
        valid: false,
        discountAmount: 0,
        error: "Please sign in to apply this first-purchase coupon.",
      };
    }
    // Count non-cancelled orders for user
    const existingOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, userId), ne(orders.status, "cancelled")));

    if (existingOrders.length > 0) {
      return {
        valid: false,
        discountAmount: 0,
        error: "This coupon code is only valid for your first purchase.",
      };
    }
  } else if (coupon.targetType === "category" || coupon.targetType === "product") {
    if (!coupon.targetValue) {
      return { valid: false, discountAmount: 0, error: "Coupon target restriction is misconfigured." };
    }

    const targetCriteria = coupon.targetValue
      .toLowerCase()
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    // Fetch product details (including category) for all items in the cart
    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const productRows = await db
      .select({ id: products.id, category: products.category })
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map<number, string>();
    productRows.forEach((p) => {
      if (p.category) {
        productMap.set(p.id, p.category.toLowerCase().trim());
      }
    });

    // Fetch all variation SKUs for these products to match
    const variationRows = await db
      .select({ id: productVariations.id, productId: productVariations.productId, sku: productVariations.sku })
      .from(productVariations)
      .where(inArray(productVariations.productId, productIds));

    let qualifyingCount = 0;
    qualifyingSubtotal = 0;

    for (const item of items) {
      const prodIdStr = item.productId.toString();
      const prodCategory = productMap.get(item.productId) || "";
      
      // Look up skus of variations for this product
      const productSkus = variationRows
        .filter((v) => v.productId === item.productId && v.sku)
        .map((v) => v.sku!.toLowerCase().trim());

      // A product matches if its ID, its Category, or any of its variation SKUs matches a target criterion
      const isMatch = targetCriteria.some((criterion) => {
        return (
          criterion === prodIdStr ||
          prodCategory === criterion ||
          prodCategory.includes(criterion) ||
          productSkus.includes(criterion)
        );
      });

      if (isMatch) {
        qualifyingSubtotal += item.price * item.quantity;
        qualifyingCount++;
      }
    }

    if (qualifyingCount === 0) {
      return {
        valid: false,
        discountAmount: 0,
        error: `This coupon is only valid for qualifying categories/products: ${coupon.targetValue}`,
      };
    }
  }

  // 4. Calculate discount
  let discountAmount = 0;

  if (coupon.discountType === "flat") {
    discountAmount = coupon.discountValue;
    // Cap discount at qualifying subtotal to avoid negative totals
    discountAmount = Math.min(discountAmount, qualifyingSubtotal);
  } else if (coupon.discountType === "percentage") {
    // If percentage, calculate percentage of qualifying subtotal
    // If cutoff price is set, cap base subtotal at cutoffPrice
    const baseAmount =
      coupon.cutoffPrice && coupon.cutoffPrice > 0
        ? Math.min(qualifyingSubtotal, coupon.cutoffPrice)
        : qualifyingSubtotal;

    discountAmount = (baseAmount * coupon.discountValue) / 100;
  }

  // Round discount to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    valid: true,
    discountAmount,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchaseAmount: coupon.minPurchaseAmount,
      cutoffPrice: coupon.cutoffPrice,
      targetType: coupon.targetType,
      targetValue: coupon.targetValue,
    },
  };
}
