"use client";

import ProductCard from "./ProductCard";
import { getFirstProductImageUrl, getProductImageUrls } from "@/utils/product";

interface Product {
  id: any;
  name: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-6 border-b border-brand/5 last:border-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-playfair font-bold text-brand tracking-tight">{title}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
        {products.map((product: any) => {
          const parsedImages = getProductImageUrls(product.images, product.colors);
          const firstImage = getFirstProductImageUrl(product.images, product.colors);

          return (
            <ProductCard 
              key={product.id}
              product={{
                id: product.id.toString(),
                name: product.name,
                description: product.description || "",
                price: product.salePrice || product.basePrice || 0,
                basePrice: product.basePrice,
                salePrice: product.salePrice,
                imageUrl: firstImage,
                images: parsedImages,
                categorySlug: product.category || ""
              }} 
            />
          );
        })}
      </div>
    </section>
  );
}
