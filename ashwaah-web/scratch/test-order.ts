import { db } from "../src/db/index";
import { products, productVariations } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function testCustomOrder() {
  console.log("Starting order test...");

  // 1. Create a dummy test product
  const productResult = await db.insert(products).values({
    name: "Test Order Product",
    description: "Testing drag and drop sorting order preservation",
    basePrice: 1000,
    salePrice: 800,
    imageUrl: "/images/test.png",
    gender: "unisex",
    category: "Shirts"
  }).returning();

  const productId = productResult[0].id;
  console.log("Created test product ID:", productId);

  // 2. Insert variations in a specific custom order: XXS, S, M (note that XXS is last alphabetically, but should be first)
  const customOrder = ["XXS", "S", "M"];
  const variationValues = customOrder.map((size) => ({
    productId,
    size,
    color: "Default",
    stock: 10,
    mrp: 1000,
    salePrice: 800,
    sku: `${productId}-${size}`
  }));

  console.log("Inserting variations in order:", customOrder);
  await db.insert(productVariations).values(variationValues);

  // 3. Query the variations using the same logic as the user-side API, ordering by ID
  const retrievedVariations = await db
    .select()
    .from(productVariations)
    .where(eq(productVariations.productId, productId))
    .orderBy(productVariations.id);

  const sizes = retrievedVariations.map((v) => v.size);
  console.log("Retrieved sizes in order:", sizes);

  // 4. Verify match
  const matches = JSON.stringify(sizes) === JSON.stringify(customOrder);
  console.log("Does retrieved order match custom insertion order?", matches ? "YES! Success!" : "NO! Failed!");

  // Clean up
  await db.delete(productVariations).where(eq(productVariations.productId, productId));
  await db.delete(products).where(eq(products.id, productId));
  console.log("Cleaned up database records.");
}

testCustomOrder().catch(console.error);
