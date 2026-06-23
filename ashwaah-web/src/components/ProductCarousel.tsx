"use client";

import { useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  if (products.length === 0) return null;

  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <section className="py-6 border-b border-brand/5 last:border-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-playfair font-bold text-brand tracking-tight">{title}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
        {paginatedProducts.map((product: any) => {
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2.5 mt-12 pt-8 border-t border-brand/5">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              currentPage === 1
                ? "bg-brand/5 text-brand/30 border border-brand/5 cursor-not-allowed opacity-60"
                : "bg-brand/5 text-brand border border-brand/10 hover:bg-brand/10 cursor-pointer active:scale-95"
            }`}
          >
            Prev
          </button>
          
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-2xl text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-brand text-[#C5A059] shadow-md scale-105"
                    : "bg-brand/5 text-brand border border-brand/10 hover:bg-brand/10 cursor-pointer active:scale-95"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              currentPage === totalPages
                ? "bg-brand/5 text-brand/30 border border-brand/5 cursor-not-allowed opacity-60"
                : "bg-brand/5 text-brand border border-brand/10 hover:bg-brand/10 cursor-pointer active:scale-95"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
