"use client";

import Link from "next/link";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import { useState, useEffect, useRef } from "react";

type NavItem = {
  id: number;
  label: string;
  href: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
};

import { motion } from "framer-motion";

export default function Home() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        const res = await fetch("/api/admin/nav");
        const data = await res.json();
        if (data.success) {
          setNavItems(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch nav items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNavItems();
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand font-sans selection:bg-brand-accent/30">
      {/* Hero Section */}
      <header className="relative w-full min-h-[70vh] flex flex-col items-center justify-center overflow-hidden border-b border-brand/10 bg-white pt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand/5 border border-brand/10 text-brand text-xs font-bold px-4 py-1.5 rounded-full mb-8 shadow-sm tracking-widest uppercase"
          >
            <Sparkles size={14} className="text-brand-accent" />
            <span>Introducing Custom Refinements</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl md:text-8xl font-playfair font-bold tracking-tight mb-8 text-brand leading-[1.1]"
          >
            Standard Sizes. <br /> <span className="text-brand-accent italic">Perfected Fits.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-brand/70 text-xl max-w-2xl mx-auto mb-4 font-inter leading-relaxed"
          >
            Ashwaah elevates dual-gender apparel. Select your base size, then refine your waist, length, and sleeves down to the millimeter.
          </motion.p>
        </motion.div>
        
        {/* Subtle background element */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand/5 to-transparent"></div>
      </header>

      {/* Featured Collections Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Dynamic Category Row */}
        <section className="w-full mx-auto mt-12 mb-16 relative group">
          {/* Navigation Arrows */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 -mt-4 z-10 bg-white/90 p-2 rounded-full shadow-lg text-brand hidden group-hover:flex hover:bg-white hover:scale-110 transition-all border border-brand/10"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 -mt-4 z-10 bg-white/90 p-2 rounded-full shadow-lg text-brand hidden group-hover:flex hover:bg-white hover:scale-110 transition-all border border-brand/10"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>

          <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-4 px-8 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center shrink-0 animate-pulse">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl bg-brand/5 mb-4"></div>
                  <div className="h-4 w-20 bg-brand/5 rounded-full"></div>
                </div>
              ))
            ) : (
              navItems.map((item) => (
                <Link 
                  key={item.id} 
                  href={item.href} 
                  className="group flex flex-col items-center shrink-0 snap-center"
                >
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden border-2 border-[#8B5CF6]/30 shadow-lg transition-transform duration-500 group-hover:scale-105 group-hover:border-[#8B5CF6] group-hover:shadow-[#8B5CF6]/20 relative">
                    <img 
                      src={item.imageUrl || "/images/placeholder.png"} 
                      alt={item.label} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      onError={e => (e.currentTarget.src = "/images/placeholder.png")}
                    />
                  </div>
                  <span className="mt-4 text-xs md:text-sm font-bold tracking-wide text-brand/80 group-hover:text-[#8B5CF6] transition-colors text-center w-full max-w-[12rem] truncate">
                    {item.label}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        <ProductGrid />
      </main>


    </div>
  );
}

