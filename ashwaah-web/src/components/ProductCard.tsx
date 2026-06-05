import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  basePrice?: number;
  salePrice?: number;
  imageUrl: string;
  categorySlug: string;
  isCustomizable?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const basePrice = product.basePrice ?? product.price ?? 0;
  const salePrice = product.salePrice ?? product.price ?? 0;
  
  // Active price to display
  const activePrice = salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;
  const originalPrice = basePrice;
  
  // Calculate discount percentage automatically
  const discount = originalPrice > 0 && activePrice < originalPrice
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
    : 0;

  return (
    <Link 
      href={`/product/${product.id}`} 
      className="group flex flex-col w-full bg-[#F5EBE0] rounded-3xl p-3 border border-brand/5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300"
    >
      {/* Top Image Section */}
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl bg-brand-light/50 border border-brand/5 shadow-sm">
        {product.isCustomizable && (
          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-brand/10 shadow-sm">
            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-brand">Customizable</span>
          </div>
        )}
        <img 
          src={product.imageUrl || "/images/placeholder.png"} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
        />
      </div>
      
      {/* Bottom Content Section */}
      <div className="pt-3 pb-0.5 px-0.5 flex flex-col flex-1">
        <h3 className="text-xs md:text-sm font-black tracking-widest text-[#1B3022] uppercase mb-0.5 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[10px] md:text-xs text-[#1B3022]/60 font-inter line-clamp-1 mb-1.5">
          {product.description || "Designer piece"}
        </p>
        
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-xs md:text-sm font-black text-[#1B3022]">
            ₹{activePrice.toLocaleString()}
          </span>
          {discount > 0 && (
            <>
              <span className="text-[10px] md:text-xs text-[#1B3022]/40 line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
              <span className="text-[10px] md:text-xs font-bold text-[#cd5533]">
                ({discount}% OFF)
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
