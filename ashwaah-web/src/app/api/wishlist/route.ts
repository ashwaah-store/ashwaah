import { NextResponse } from "next/server";
import { db } from "@/db";
import { wishlists, products, users, productVariations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const phone = cookieStore.get("auth_session")?.value;

    if (!phone) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db.select().from(users).where(eq(users.phoneNumber, phone)).limit(1);
    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const dbWishlist = await db.select({
      id: wishlists.id,
      productId: wishlists.productId,
      product: {
        id: products.id,
        name: products.name,
        description: products.description,
        basePrice: products.basePrice,
        salePrice: products.salePrice,
        images: products.images,
        category: products.category,
        isCustomizable: products.isCustomizable,
      }
    })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.userId, user.id));

    // Calculate total stock for each wishlisted product
    const itemsWithStock = await Promise.all(dbWishlist.map(async (item) => {
      const vars = await db.select().from(productVariations).where(eq(productVariations.productId, item.productId));
      const totalStock = vars.reduce((sum, v) => sum + v.stock, 0);
      return {
        ...item,
        totalStock
      };
    }));

    return NextResponse.json({ success: true, items: itemsWithStock });
  } catch (error: any) {
    console.error("Wishlist Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const phone = cookieStore.get("auth_session")?.value;

    if (!phone) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db.select().from(users).where(eq(users.phoneNumber, phone)).limit(1);
    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    // Check if product exists
    const productResult = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (productResult.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Check if already exists in wishlist
    const existing = await db.select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ success: true, message: "Product already in wishlist" });
    }

    await db.insert(wishlists).values({
      userId: user.id,
      productId: productId,
    });

    return NextResponse.json({ success: true, message: "Product added to wishlist" });
  } catch (error: any) {
    console.error("Wishlist Add Error:", error);
    return NextResponse.json({ success: false, error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const phone = cookieStore.get("auth_session")?.value;

    if (!phone) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db.select().from(users).where(eq(users.phoneNumber, phone)).limit(1);
    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const productIdStr = searchParams.get("productId");
    if (!productIdStr) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const productId = parseInt(productIdStr);

    await db.delete(wishlists)
      .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)));

    return NextResponse.json({ success: true, message: "Product removed from wishlist" });
  } catch (error: any) {
    console.error("Wishlist Remove Error:", error);
    return NextResponse.json({ success: false, error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
