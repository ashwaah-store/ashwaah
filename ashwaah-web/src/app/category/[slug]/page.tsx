import { db } from "@/db";
import { navigationMenu, pageSections, products, homepageCategories } from "@/db/schema";
import { eq, inArray, asc, or } from "drizzle-orm";
import ProductCarousel from "@/components/ProductCarousel";
import ProductCard from "@/components/ProductCard";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  
  // 1. Find the category item (first check navigation menu)
  const href = `/category/${slug}`;
  const menuResult = await db.select()
    .from(navigationMenu)
    .where(eq(navigationMenu.href, href))
    .limit(1);

  let categoryName = "";
  let isFromNav = false;

  if (menuResult.length > 0) {
    categoryName = menuResult[0].label;
    isFromNav = true;
  } else {
    // Check homepage category grid cards
    const homeCatResult = await db.select()
      .from(homepageCategories)
      .limit(100);
      
    // Find item matching the slug
    const matchingHomeCat = homeCatResult.find(
      (item) => item.name.toLowerCase().trim().replace(/\s+/g, "-") === slug || item.link === href
    );

    if (matchingHomeCat) {
      categoryName = matchingHomeCat.name;
    }
  }

  // 2. If not found in either, show Not Found
  if (!categoryName) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-playfair font-bold text-brand mb-4">Category Not Found</h1>
        <Link href="/" className="text-[#C5A059] font-bold uppercase tracking-widest text-xs hover:underline">Return Home</Link>
      </div>
    );
  }

  // 3. Fetch sections for this category (if it is a navigation item)
  let sectionsWithProducts: any[] = [];
  if (isFromNav && menuResult.length > 0) {
    const sections = await db.select()
      .from(pageSections)
      .where(eq(pageSections.menuId, menuResult[0].id))
      .orderBy(asc(pageSections.displayOrder));

    sectionsWithProducts = await Promise.all(
      sections.map(async (section) => {
        const productIds = section.productIds
          .split(",")
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id));

        let hydratedProducts: any[] = [];
        if (productIds.length > 0) {
          hydratedProducts = await db.select()
            .from(products)
            .where(inArray(products.id, productIds));
        }

        return {
          ...section,
          products: hydratedProducts
        };
      })
    );
  }

  // 4. If no custom sections exist, dynamically query all products matching this category name
  let displayProducts: any[] = [];
  if (sectionsWithProducts.length === 0) {
    const categorySlug = categoryName.toLowerCase().trim().replace(/\s+/g, "-");
    displayProducts = await db.select()
      .from(products)
      .where(
        or(
          eq(products.category, categoryName),
          eq(products.category, slug),
          eq(products.category, categorySlug)
        )
      );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-playfair font-bold text-brand mb-4 tracking-tight">{categoryName}</h1>
        <div className="w-24 h-1 bg-[#C5A059] mx-auto rounded-full mb-4"></div>
        <p className="text-brand/70 max-w-2xl mx-auto font-inter leading-relaxed">
          Explore our curated selection of premium {categoryName.toLowerCase()} pieces, 
          each designed with meticulous attention to detail and crafted for an impeccable fit.
        </p>
      </div>
      
      {/* Rendering: Sections (Carousel) or Product Grid */}
      {sectionsWithProducts.length > 0 ? (
        <div className="space-y-0">
          {sectionsWithProducts.map((section) => (
            <ProductCarousel 
              key={section.id} 
              title={section.title} 
              products={section.products} 
            />
          ))}
        </div>
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-8">
          {displayProducts.map((p) => {
            let firstImage = "/images/placeholder.png";
            try {
              const parsedImages = JSON.parse(p.images || "[]");
              if (parsedImages.length > 0) {
                firstImage = parsedImages[0];
              } else if (p.imageUrl) {
                firstImage = p.imageUrl;
              }
            } catch (e) {
              if (p.imageUrl) firstImage = p.imageUrl;
            }

            const productProps = {
              id: String(p.id),
              name: p.name,
              description: p.description || "",
              price: p.salePrice || p.basePrice,
              basePrice: p.basePrice,
              salePrice: p.salePrice,
              imageUrl: firstImage,
              categorySlug: slug,
              isCustomizable: p.isCustomizable || false
            };
            return <ProductCard key={p.id} product={productProps} />;
          })}
        </div>
      ) : (
        <section className="py-20 text-center bg-brand/5 rounded-[3rem] border border-brand/10 px-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingBag className="text-[#C5A059]" size={32} />
          </div>
          <h2 className="text-2xl font-playfair font-bold text-brand mb-3">Collection Coming Soon</h2>
          <p className="text-brand/60 max-w-sm mx-auto">
            We are currently curating the perfect selection for this category. Check back soon for the latest arrivals.
          </p>
        </section>
      )}
    </div>
  );
}
