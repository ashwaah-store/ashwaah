"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

type NavItem = {
  id: number;
  label: string;
  href: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
};

import { motion, AnimatePresence } from "framer-motion";

function parseOfferText(text: string) {
  if (text.includes("|")) {
    const parts = text.split("|");
    return { title: parts[0].trim(), subtitle: parts[1].trim() };
  }
  if (text.includes("!")) {
    const parts = text.split("!");
    const title = parts[0].trim();
    const subtitle = parts.slice(1).join("!").trim();
    return { title, subtitle: subtitle || null };
  }
  return { title: text.trim(), subtitle: null };
}

export default function Home() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [bannerUrl, setBannerUrl] = useState("");
  const [offers, setOffers] = useState<any[]>([]);
  const [homepageCatCards, setHomepageCatCards] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const [isHovered, setIsHovered] = useState(false);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    if (isLoading || navItems.length === 0 || !carouselRef.current) return;

    let animationFrameId: number;
    const scrollContainer = carouselRef.current;
    const scrollSpeed = 0.6; // Very slow speed (pixels per frame)

    const updateScroll = () => {
      if (!isHovered) {
        scrollPosRef.current += scrollSpeed;
        const maxScroll = scrollContainer.scrollWidth / 2;

        if (scrollPosRef.current >= maxScroll) {
          scrollPosRef.current = 0;
        }
        scrollContainer.scrollLeft = scrollPosRef.current;
      }
      animationFrameId = requestAnimationFrame(updateScroll);
    };

    const handleScroll = () => {
      if (Math.abs(scrollContainer.scrollLeft - scrollPosRef.current) > 2) {
        scrollPosRef.current = scrollContainer.scrollLeft;
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    animationFrameId = requestAnimationFrame(updateScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [isLoading, navItems, isHovered]);



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

  useEffect(() => {
    async function fetchData() {
      try {
        const resBanner = await fetch("/api/admin/settings?key=homepage_banner");
        const dataBanner = await resBanner.json();
        if (dataBanner.success && dataBanner.data) {
          setBannerUrl(dataBanner.data.value);
        }

        const resOffers = await fetch("/api/admin/offers");
        const dataOffers = await resOffers.json();
        if (dataOffers.success) {
          setOffers(dataOffers.data);
        }

        const resCatCards = await fetch("/api/admin/homepage-categories");
        const dataCatCards = await resCatCards.json();
        if (dataCatCards.success) {
          setHomepageCatCards(dataCatCards.data);
        }
      } catch (err) {
        console.error("Failed to fetch settings/offers/categories", err);
      }
    }
    fetchData();
  }, []);

  const banners = useMemo(() => {
    if (!bannerUrl) return [];
    try {
      const parsed = JSON.parse(bannerUrl);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          if (typeof item === "string") return { url: item, link: null };
          return { url: item.url || "", link: item.link || null };
        });
      }
    } catch (e) {
      // Fallback to legacy
    }
    return bannerUrl.split(",").map((url) => ({ url: url.trim(), link: null })).filter(b => b.url);
  }, [bannerUrl]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const marqueeItems = useMemo(() => {
    if (offers.length === 0) return [];
    const repeats = offers.length === 1 ? 12 : offers.length === 2 ? 6 : 4;
    const list = [];
    for (let i = 0; i < repeats; i++) {
      list.push(...offers);
    }
    return list;
  }, [offers]);

  return (
    <div className="min-h-screen bg-brand-light text-brand font-sans selection:bg-brand-accent/30">
      {/* Dynamic Offer Announcement Bar (Continuous Scrolling Marquee) */}
      {offers.length > 0 && (
        <div className="w-full bg-[#064e3b] text-white h-12 flex items-center overflow-hidden border-b border-[#064e3b]/10 relative z-30 shadow-sm">
          <div className="w-full flex items-center overflow-hidden relative">
            <div className="flex animate-marquee whitespace-nowrap">
              <div className="flex shrink-0 gap-6 items-center px-3">
                {marqueeItems.map((offer, idx) => {
                  const { title, subtitle } = parseOfferText(offer.text);
                  const displayText = subtitle ? `${title} — ${subtitle}` : title;
                  return (
                    <div key={idx} className="flex items-center gap-6 shrink-0">
                      {offer.link ? (
                        <Link href={offer.link} className="hover:text-brand-accent transition-colors duration-300 font-inter text-[13px] sm:text-sm font-bold tracking-wider uppercase whitespace-nowrap">
                          {displayText}
                        </Link>
                      ) : (
                        <span className="font-inter text-[13px] sm:text-sm font-bold tracking-wider uppercase whitespace-nowrap">
                          {displayText}
                        </span>
                      )}
                      <span className="text-brand-accent text-[13px] sm:text-sm select-none">★</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex shrink-0 gap-6 items-center px-3" aria-hidden="true">
                {marqueeItems.map((offer, idx) => {
                  const { title, subtitle } = parseOfferText(offer.text);
                  const displayText = subtitle ? `${title} — ${subtitle}` : title;
                  return (
                    <div key={`dup-${idx}`} className="flex items-center gap-6 shrink-0">
                      {offer.link ? (
                        <Link href={offer.link} className="hover:text-brand-accent transition-colors duration-300 font-inter text-[13px] sm:text-sm font-bold tracking-wider uppercase whitespace-nowrap">
                          {displayText}
                        </Link>
                      ) : (
                        <span className="font-inter text-[13px] sm:text-sm font-bold tracking-wider uppercase whitespace-nowrap">
                          {displayText}
                        </span>
                      )}
                      <span className="text-brand-accent text-[13px] sm:text-sm select-none">★</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Dynamic Promo Banner Carousel */}
      {banners.length > 0 && (
        <div className="w-full relative overflow-hidden border-b border-brand/10 group mt-0 bg-brand-light">
          {banners.length === 1 ? (
            <div className="w-full relative h-auto">
              {banners[0].link === "#featured-collections" ? (
                <a
                  href="#featured-collections"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("featured-collections")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="block w-full h-auto cursor-pointer hover:scale-[1.005] active:scale-[0.995] transition-all duration-300"
                >
                  <img
                    src={banners[0].url}
                    alt="Current Offers & Collections"
                    className="w-full h-auto transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                  />
                </a>
              ) : banners[0].link ? (
                <Link
                  href={banners[0].link}
                  className="block w-full h-auto cursor-pointer hover:scale-[1.005] active:scale-[0.995] transition-all duration-300"
                >
                  <img
                    src={banners[0].url}
                    alt="Current Offers & Collections"
                    className="w-full h-auto transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                  />
                </Link>
              ) : (
                <img
                  src={banners[0].url}
                  alt="Current Offers & Collections"
                  className="w-full h-auto transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                />
              )}
              <div className="absolute inset-0 bg-black/[0.02] pointer-events-none"></div>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden aspect-[21/9] sm:aspect-[21/9] md:aspect-[3/1] lg:aspect-[21/9]">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentBannerIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  {banners[currentBannerIndex]?.link === "#featured-collections" ? (
                    <a
                      href="#featured-collections"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("featured-collections")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="block w-full h-full cursor-pointer hover:scale-[1.005] active:scale-[0.995] transition-all duration-300"
                    >
                      <img
                        src={banners[currentBannerIndex]?.url}
                        alt={`Promo Banner ${currentBannerIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ) : banners[currentBannerIndex]?.link ? (
                    <Link
                      href={banners[currentBannerIndex].link}
                      className="block w-full h-full cursor-pointer hover:scale-[1.005] active:scale-[0.995] transition-all duration-300"
                    >
                      <img
                        src={banners[currentBannerIndex]?.url}
                        alt={`Promo Banner ${currentBannerIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  ) : (
                    <img
                      src={banners[currentBannerIndex]?.url}
                      alt={`Promo Banner ${currentBannerIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-black/[0.02] pointer-events-none"></div>

              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={() =>
                  setCurrentBannerIndex(
                    (prev) => (prev - 1 + banners.length) % banners.length
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-brand shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-brand shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              >
                <ChevronRight size={20} />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentBannerIndex
                        ? "bg-[#C5A059] w-6"
                        : "bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Featured Collections Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Dynamic Category Row */}
        <section className="w-full mx-auto mt-12 mb-4 relative group">


          <div 
            ref={carouselRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
            className="flex gap-6 overflow-x-auto pb-6 pt-4 px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {isLoading ? (
               Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center shrink-0 animate-pulse">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl bg-brand/5 mb-4"></div>
                  <div className="h-4 w-20 bg-brand/5 rounded-full"></div>
                </div>
              ))
            ) : (
              [...navItems, ...navItems].map((item, index) => (
                <Link 
                  key={`${item.id}-${index}`} 
                  href={item.href} 
                  className="group flex flex-col items-center shrink-0"
                >
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden border-2 border-[#064e3b]/30 shadow-lg transition-transform duration-500 group-hover:scale-105 group-hover:border-[#064e3b] group-hover:shadow-[#064e3b]/20 relative">
                    <img 
                      src={item.imageUrl || "/images/placeholder.png"} 
                      alt={item.label} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      onError={e => (e.currentTarget.src = "/images/placeholder.png")}
                    />
                  </div>
                  <span className="mt-4 text-xs md:text-sm font-bold tracking-wide text-brand/80 group-hover:text-[#064e3b] transition-colors text-center w-full max-w-[12rem] break-words block">
                    {item.label}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Dynamic Category Promo Grid Cards (Grid of aspect-3/4 blocks) */}
        {homepageCatCards.length > 0 && (
          <section className="w-full mx-auto mb-4">
            {/* Categories Heading */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center mb-12 border-b border-brand/10 pb-6"
            >
              <div>
                <h2 className="text-4xl font-playfair font-bold mb-3 text-brand">Categories</h2>
                <p className="text-brand/60 italic">Pre-made or personalized, always perfect for you.</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {homepageCatCards.map((item) => {
                const CardContent = (
                  <div className="group relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-lg border border-brand/5 flex flex-col justify-end transition-all duration-500 hover:scale-[1.03] hover:shadow-xl">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      onError={e => (e.currentTarget.src = "/images/placeholder.png")}
                    />
                    {/* Shadow overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none"></div>
                    
                    {/* Overlaid coral-orange card at bottom */}
                    <div className="relative z-10 w-full p-3 bg-[#064e3b]/90 backdrop-blur-sm text-white rounded-t-2xl text-center transition-all duration-300 group-hover:bg-[#064e3b] flex flex-col items-center justify-center">
                      <span className="text-[9px] md:text-[10px] tracking-wider uppercase font-medium text-center w-full block break-words">
                        {item.name}
                      </span>
                      <span className="text-base md:text-lg font-bold tracking-tight leading-tight my-0.5 uppercase text-center w-full block break-words">
                        {item.promoText}
                      </span>
                      <span className="text-[8px] font-bold tracking-widest uppercase border-t border-white/20 pt-1 mt-1 w-full block transition-colors group-hover:text-white">
                        {item.actionText || "Shop Now"}
                      </span>
                    </div>
                  </div>
                );

                // If link is empty, construct a dynamic fallback path like /category/ethnic-wear
                const targetLink = item.link || `/category/${item.name.toLowerCase().trim().replace(/\s+/g, "-")}`;

                return (
                  <Link key={item.id} href={targetLink} className="block">
                    {CardContent}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <ProductGrid />
      </main>


    </div>
  );
}

