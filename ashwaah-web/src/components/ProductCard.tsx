import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categorySlug: string;
  isCustomizable?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link 
      href={`/product/${product.id}`} 
      className="group flex flex-col w-full bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 transition-all duration-300"
    >
      {/* Top Image Section */}
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        {product.isCustomizable && (
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-brand/10 shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand">Customizable</span>
          </div>
        )}
        <img 
          src={product.imageUrl || "/images/placeholder.png"} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
        />
      </div>
      
      {/* Bottom Content Section */}
      <div className="p-5 md:p-6 flex flex-col flex-1 bg-white">
        <h3 className="text-xl md:text-2xl font-playfair font-bold text-[#01353c] mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 font-inter line-clamp-1 mb-5">
          {product.description || "Designer piece"}
        </p>
        
        <div className="w-full h-px bg-gray-100/80 mb-5"></div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="text-lg md:text-xl font-bold text-[#01353c]">
            ₹{(product.price || 0).toLocaleString()}
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#01353c] group-hover:bg-[#01353c] group-hover:text-white transition-colors duration-300">
            <ArrowRight size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}
