"use client";

import React, { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, Check, X, LayoutGrid, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ProductCarousel from "@/components/ProductCarousel";
import ProductCard from "@/components/ProductCard";
import { getFirstProductImageUrl, getProductImageUrls } from "@/utils/product";


interface Product {
  id: any;
  name: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  images: string | null;
  imageUrl: string | null;
  colors: string | null;
  category: string | null;
  gender: string | null;
  isCustomizable: boolean | null;
  tags?: string | null;
  style?: string | null;
  keyWords?: string | null;
  filterCategory?: string | null;
  specifications?: string | null;
  sizes?: string[];
}

interface Section {
  id: any;
  title: string;
  menuId: number;
  productIds: string;
  displayOrder: number;
  products: Product[];
}

interface CategoryFilterSectionProps {
  initialSections: Section[];
  initialDisplayProducts: Product[];
  categoryName: string;
  slug: string;
  filterTypes?: string | null;
}

const COLOR_MAP: Record<string, string> = {
  white: "#FFFFFF",
  black: "#171717",
  red: "#EF4444",
  blue: "#3B82F6",
  "sky blue": "#0EA5E9",
  navy: "#1E3A8A",
  grey: "#737373",
  gray: "#737373",
  brown: "#78350F",
  maroon: "#5C1D16",
  pink: "#EC4899",
  beige: "#EADED2",
  gold: "#C5A059",
  "forest green": "#1B3022",
  green: "#22C55E",
  yellow: "#EAB308",
};

const isPluralInsensitiveEqual = (a: string, b: string) => {
  const clean = (s: string) => s.toLowerCase().trim();
  const ca = clean(a);
  const cb = clean(b);
  if (ca === cb) return true;
  if (ca + "s" === cb || cb + "s" === ca) return true;
  if (ca.replace(/s$/, "") === cb.replace(/s$/, "")) return true;
  return false;
};

export default function CategoryFilterSection({
  initialSections,
  initialDisplayProducts,
  categoryName,
  slug,
  filterTypes,
}: CategoryFilterSectionProps) {
  // 1. Flatten and deduplicate all products for filtering
  const allProducts = useMemo(() => {
    const map = new Map<string, Product>();

    initialDisplayProducts.forEach((p) => {
      map.set(String(p.id), p);
    });

    initialSections.forEach((section) => {
      (section.products || []).forEach((p) => {
        map.set(String(p.id), p);
      });
    });

    return Array.from(map.values());
  }, [initialSections, initialDisplayProducts]);

  // Parse admin configured filter types
  const adminFilterTypes = useMemo(() => {
    if (!filterTypes) return null;
    return filterTypes
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, [filterTypes]);

  // Helper to check if a product matches a type
  const isTypeMatch = (type: string, name: string, category: string, tags: string, style: string, keyWords: string) => {
    const lowerType = type.toLowerCase().trim();
    const lowerName = name.toLowerCase();
    const lowerCategory = category.toLowerCase();
    const lowerTags = tags.toLowerCase();
    const lowerStyle = style.toLowerCase();
    const lowerKeyWords = keyWords.toLowerCase();

    // Check direct inclusion
    return (
      lowerCategory.includes(lowerType) ||
      lowerTags.includes(lowerType) ||
      lowerName.includes(lowerType) ||
      lowerStyle.includes(lowerType) ||
      lowerKeyWords.includes(lowerType)
    );
  };



  // 2. Classify product types dynamically
  const productsWithTypes = useMemo(() => {
    return allProducts.map((p) => {
      let type = "Other";
      const name = (p.name || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      const tags = (p.tags || "").toLowerCase();
      let resolvedStyle = p.style || "";
      let resolvedKeyWords = p.keyWords || "";
      if (p.specifications) {
        try {
          const specs = JSON.parse(p.specifications);
          if (specs["Style"]) resolvedStyle = specs["Style"];
          if (specs["Key Words"]) resolvedKeyWords = specs["Key Words"];
          if (specs["Key Details"]) resolvedKeyWords = specs["Key Details"];
        } catch {}
      }
      const style = resolvedStyle.toLowerCase();
      const keyWords = resolvedKeyWords.toLowerCase();

      const rawFilterCat = (p.filterCategory || "").trim();

      if (rawFilterCat) {
        if (adminFilterTypes && adminFilterTypes.length > 0) {
          const matched = adminFilterTypes.find(t => isPluralInsensitiveEqual(t, rawFilterCat));
          type = matched || rawFilterCat;
        } else {
          type = rawFilterCat;
        }
      } else if (adminFilterTypes && adminFilterTypes.length > 0) {
        // Fall back to keyword matching using isTypeMatch
        const sortedAdminTypes = [...adminFilterTypes].sort((a, b) => b.length - a.length);
        const matchedType = sortedAdminTypes.find((t) => isTypeMatch(t, name, category, tags, style, keyWords));
        type = matchedType || "Other";
      } else {
        type = p.category || "Other";
      }

      return { ...p, classifiedType: type };
    });
  }, [allProducts, adminFilterTypes]);

  // 3. Extract unique types and colors dynamically
  const availableTypes = useMemo(() => {
    const typesSet = new Set<string>();
    
    // 1. Add all configured admin filter types
    if (adminFilterTypes && adminFilterTypes.length > 0) {
      adminFilterTypes.forEach(t => typesSet.add(t));
    }
    
    // 2. Add custom filter categories from products of this category (based on the product added)
    productsWithTypes.forEach((p) => {
      if (p.filterCategory && typeof p.filterCategory === "string" && p.filterCategory.trim()) {
        const trimmed = p.filterCategory.trim();
        const matched = adminFilterTypes?.find(t => isPluralInsensitiveEqual(t, trimmed));
        typesSet.add(matched || trimmed);
      }
      
      // If no admin filter types are configured, fallback to classifiedType
      if (!adminFilterTypes || adminFilterTypes.length === 0) {
        if (p.classifiedType) typesSet.add(p.classifiedType);
      }
    });

    // 3. Include "Other" if there are any products classified as "Other"
    if (adminFilterTypes && adminFilterTypes.length > 0) {
      const specificTypes = Array.from(typesSet);
      const hasOther = productsWithTypes.some((p) => !specificTypes.includes(p.classifiedType));
      if (hasOther) {
        typesSet.add("Other");
      }
    }
    
    return Array.from(typesSet);
  }, [productsWithTypes, adminFilterTypes]);

  const availableColors = useMemo(() => {
    const colorsSet = new Set<string>();
    productsWithTypes.forEach((p) => {
      try {
        const parsed = JSON.parse(p.colors || "[]");
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            if (c && typeof c === "string" && c.trim()) {
              colorsSet.add(c.trim());
            }
          });
        } else if (typeof p.colors === "string" && p.colors.trim()) {
          colorsSet.add(p.colors.trim());
        }
      } catch {
        if (typeof p.colors === "string" && p.colors.trim()) {
          colorsSet.add(p.colors.trim());
        }
      }
    });
    return Array.from(colorsSet).sort();
  }, [productsWithTypes]);

  // 3.5 Dynamic Price Limits Computation
  const [minLimit, maxLimit] = useMemo(() => {
    if (productsWithTypes.length === 0) return [0, 10000];
    let min = Infinity;
    let max = -Infinity;
    productsWithTypes.forEach((p) => {
      const price = p.salePrice || p.basePrice || 0;
      if (price < min) min = price;
      if (price > max) max = price;
    });
    if (min === Infinity || max === -Infinity) return [0, 10000];
    if (min === max) return [Math.max(0, min - 100), min + 100];
    return [Math.floor(min), Math.ceil(max)];
  }, [productsWithTypes]);

  // 4. State Management (Multi-select arrays)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [activeThumb, setActiveThumb] = useState<"min" | "max">("min");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setPriceRange([minLimit, maxLimit]);
  }, [minLimit, maxLimit]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTypes, selectedColors, selectedSizes, priceRange, sortBy]);

  useEffect(() => {
    if (allProducts.length === 0) {
      document.body.classList.add("hide-footer");
      return () => {
        document.body.classList.remove("hide-footer");
      };
    }
  }, [allProducts.length]);

  const isPriceFilterActive = priceRange[0] !== minLimit || priceRange[1] !== maxLimit;
  const isFilterOrSortActive =
    selectedTypes.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    sortBy !== "default" ||
    isPriceFilterActive;

  // Determine if this is a shoes/footwear category
  const isShoesCategory = useMemo(() => {
    const term = (categoryName || slug || "").toLowerCase();
    return term.includes("shoe") || term.includes("footwear") || term.includes("slipper") || term.includes("sandal") || term.includes("flip-flop") || term.includes("flip flop");
  }, [categoryName, slug]);

  const availableSizes = useMemo(() => {
    return isShoesCategory 
      ? ["5", "6", "7", "8", "9", "10", "11", "12"]
      : ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  }, [isShoesCategory]);

  // 5. Calculate counts dynamically based on the current collection
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productsWithTypes.forEach((p) => {
      const type = p.classifiedType;
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [productsWithTypes]);

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productsWithTypes.forEach((p) => {
      try {
        const parsed = JSON.parse(p.colors || "[]");
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            const trimmed = c.trim();
            if (trimmed) {
              counts[trimmed] = (counts[trimmed] || 0) + 1;
            }
          });
        } else if (p.colors && typeof p.colors === "string") {
          const trimmed = p.colors.trim();
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        }
      } catch {
        if (p.colors && typeof p.colors === "string") {
          const trimmed = p.colors.trim();
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        }
      }
    });
    return counts;
  }, [productsWithTypes]);

  const sizeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productsWithTypes.forEach((p) => {
      const sizes = p.sizes || [];
      sizes.forEach((s) => {
        const normalized = s.toUpperCase().trim();
        counts[normalized] = (counts[normalized] || 0) + 1;
      });
    });
    return counts;
  }, [productsWithTypes]);

  // 6. Filtering and Sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...productsWithTypes];

    // Filter by selected types (OR logic: show products matching any selected type)
    if (selectedTypes.length > 0) {
      list = list.filter((p) => selectedTypes.includes(p.classifiedType));
    }

    // Filter by selected colors (OR logic: show products matching any selected color)
    if (selectedColors.length > 0) {
      list = list.filter((p) => {
        try {
          const parsed = JSON.parse(p.colors || "[]");
          if (Array.isArray(parsed)) {
            return parsed.some((c) => selectedColors.includes(c.trim()));
          }
          return selectedColors.includes(String(p.colors).trim());
        } catch {
          return selectedColors.includes(String(p.colors).trim());
        }
      });
    }

    // Filter by selected sizes (OR logic: show products matching any selected size)
    if (selectedSizes.length > 0) {
      list = list.filter((p) => {
        const pSizes = (p.sizes || []).map((s) => s.toUpperCase().trim());
        return selectedSizes.some((sz) => pSizes.includes(sz.toUpperCase().trim()));
      });
    }

    // Filter by price range
    list = list.filter((p) => {
      const price = p.salePrice || p.basePrice || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort by Price (salePrice if available, otherwise basePrice)
    if (sortBy === "price-asc") {
      list.sort((a, b) => {
        const priceA = a.salePrice || a.basePrice || 0;
        const priceB = b.salePrice || b.basePrice || 0;
        return priceA - priceB;
      });
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => {
        const priceA = a.salePrice || a.basePrice || 0;
        const priceB = b.salePrice || b.basePrice || 0;
        return priceB - priceA;
      });
    }

    return list;
  }, [productsWithTypes, selectedTypes, selectedColors, selectedSizes, sortBy, priceRange]);

  const productsPerPage = 20;
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortBy("default");
    setPriceRange([minLimit, maxLimit]);
  };

  if (allProducts.length === 0) {
    return (
      <div className="flex-grow min-w-0 px-4 py-4 md:py-6 max-w-lg mx-auto w-full flex flex-col justify-center">
        {/* Header Title & Description */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl md:text-3xl font-playfair font-bold text-brand mb-1 tracking-tight">{categoryName}</h1>
          <div className="w-12 h-0.5 bg-[#C5A059] mx-auto rounded-full mb-2"></div>
          <p className="text-brand/70 max-w-sm mx-auto font-inter leading-relaxed text-[11px]">
            Explore our curated selection of premium {categoryName.toLowerCase()} pieces, 
            each designed with meticulous attention to detail and crafted for an impeccable fit.
          </p>
        </div>
        
        <div
          className="py-6 md:py-8 text-center bg-brand/5 rounded-[1.5rem] border border-brand/10 px-5 max-w-sm w-full mx-auto shadow-sm"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShoppingBag className="text-[#C5A059]" size={16} />
          </div>
          <h2 className="text-base font-playfair font-bold text-brand mb-0.5">Coming Soon</h2>
          <p className="text-brand/60 max-w-xs mx-auto text-[10px] mb-4 leading-relaxed font-inter">
            No products have been added to this collection yet. We are currently curating new premium styles for you.
          </p>
          <Link
            href="/"
            className="inline-block bg-brand text-white text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-brand-hover shadow-md transition-all duration-300 cursor-pointer"
          >
            Browse Other Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full items-stretch relative z-30">
      
      {/* Mobile Show Filters Toggle Button */}
      <div className="lg:hidden w-full sticky top-12 z-40 bg-brand-light/95 backdrop-blur-sm py-2 px-1 mb-2">
        <button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="w-full flex items-center justify-between bg-white border border-brand/10 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-brand shadow-sm active:scale-99 transition-all"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-[#C5A059]" />
            {isMobileFiltersOpen ? "Hide Filters" : "Show Filters"}
          </span>
          <span className="text-[#C5A059] font-black">
            {isFilterOrSortActive ? `(${selectedTypes.length + selectedColors.length + selectedSizes.length + (isPriceFilterActive ? 1 : 0)} Active)` : ""}
          </span>
        </button>
      </div>

      {/* Left Column: Filter Sidebar Panel */}
      <aside
        className={`w-full lg:w-60 flex-shrink-0 bg-[#FFFDF6] border-r border-brand/10 p-4 lg:px-4 lg:py-6 rounded-none lg:sticky lg:top-12 lg:h-[calc(100vh-48px)] lg:overflow-y-auto custom-scrollbar lg:block ${
          isMobileFiltersOpen ? "block" : "hidden"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand/5 mb-6">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand">Filters</h2>
          {isFilterOrSortActive && (
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-black uppercase text-red-600 hover:text-red-700 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Section 1: Categories / Types */}
        {availableTypes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Categories</h3>
            <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {availableTypes.map((type) => {
                const count = typeCounts[type] || 0;
                const isChecked = selectedTypes.includes(type);

                return (
                  <label
                    key={type}
                    className="flex items-center gap-3 text-xs font-bold text-brand/75 cursor-pointer hover:text-brand transition-colors select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTypeToggle(type)}
                      className="rounded border-brand/20 accent-brand w-4 h-4 cursor-pointer"
                    />
                    <span className="flex-1">{type}</span>
                    <span className="text-brand/35 text-[10px] font-medium">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Colors */}
        {availableColors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Color</h3>
            <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {availableColors.map((color) => {
                const count = colorCounts[color] || 0;
                const isChecked = selectedColors.includes(color);
                const lowerColor = color.toLowerCase();
                const hexCode = COLOR_MAP[lowerColor] || (color.startsWith("#") ? color : "#CCCCCC");
                const isWhite = lowerColor === "white" || hexCode === "#FFFFFF";

                return (
                  <label
                    key={color}
                    className="flex items-center gap-3 text-xs font-bold text-brand/75 cursor-pointer hover:text-brand transition-colors select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleColorToggle(color)}
                      className="rounded border-brand/20 accent-brand w-4 h-4 cursor-pointer"
                    />
                    {/* Circle Swatch */}
                    <span
                      className={`w-3.5 h-3.5 rounded-full inline-block border shadow-sm flex-shrink-0 ${
                        isWhite ? "border-brand/20" : "border-transparent"
                      }`}
                      style={{ backgroundColor: hexCode }}
                    />
                    <span className="flex-1">{color}</span>
                    <span className="text-brand/35 text-[10px] font-medium">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Sizes */}
        {availableSizes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const count = sizeCounts[size.toUpperCase()] || 0;
                const isChecked = selectedSizes.includes(size);

                return (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`h-9 min-w-[2.25rem] px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${
                      isChecked
                        ? "bg-[#064e3b] border-[#064e3b] text-white shadow-sm"
                        : "bg-white border-brand/10 text-brand hover:border-brand/30 hover:bg-brand/5"
                    }`}
                  >
                    <span>{size}</span>
                    <span className={`text-[9px] ${isChecked ? "text-white/60" : "text-brand/30"}`}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Range Slider */}
        <div className="mb-4 pb-4 border-b border-brand/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 ml-1">Price Range</h3>
            <span className="text-xs font-bold text-brand/80">
              ₹{priceRange[0].toLocaleString("en-IN")} - ₹{priceRange[1].toLocaleString("en-IN")}{priceRange[1] >= maxLimit ? "+" : ""}
            </span>
          </div>
          
          <div className="range-slider-container relative w-full h-5 flex items-center px-1">
            {/* Track background */}
            <div className="absolute left-1 right-1 h-1 bg-brand/10 rounded-full pointer-events-none" />
            {/* Highlight track */}
            <div
              className="absolute h-1 bg-[#FF4E20] rounded-full pointer-events-none"
              style={{
                left: `${((priceRange[0] - minLimit) / (maxLimit - minLimit || 1)) * 100}%`,
                right: `${100 - ((priceRange[1] - minLimit) / (maxLimit - minLimit || 1)) * 100}%`
              }}
            />
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              value={priceRange[0]}
              onMouseDown={() => setActiveThumb("min")}
              onTouchStart={() => setActiveThumb("min")}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), priceRange[1]);
                setPriceRange([val, priceRange[1]]);
              }}
              style={{ zIndex: activeThumb === "min" ? 25 : 20 }}
              className="absolute left-0 w-full top-0 h-5 appearance-none bg-transparent cursor-pointer pointer-events-none"
            />
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              value={priceRange[1]}
              onMouseDown={() => setActiveThumb("max")}
              onTouchStart={() => setActiveThumb("max")}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), priceRange[0]);
                setPriceRange([priceRange[0], val]);
              }}
              style={{ zIndex: activeThumb === "max" ? 25 : 20 }}
              className="absolute left-0 w-full top-0 h-5 appearance-none bg-transparent cursor-pointer pointer-events-none"
            />
          </div>
        </div>

        {/* Section 4: Sort By */}
        <div className="pt-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Sort Products</h3>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-brand/5 border border-brand/10 hover:border-brand-accent/50 text-brand text-xs font-bold uppercase tracking-widest py-3 pl-4 pr-10 rounded-2xl outline-none appearance-none cursor-pointer transition-all shadow-sm"
            >
              <option value="default" className="text-brand bg-[#FFFDF6]">Default</option>
              <option value="price-asc" className="text-brand bg-[#FFFDF6]">Price: Low to High</option>
              <option value="price-desc" className="text-brand bg-[#FFFDF6]">Price: High to Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand/50 pointer-events-none" />
          </div>
        </div>
      </aside>

      {/* Right Column: Products Content Area */}
      <div className="flex-grow min-w-0 px-4 sm:px-6 lg:px-8 py-8 lg:py-10 max-w-7xl mx-auto">
        {/* Header Title & Description */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-brand mb-3 tracking-tight">{categoryName}</h1>
          <div className="w-20 h-1 bg-[#C5A059] lg:mx-0 mx-auto rounded-full mb-3"></div>
          <p className="text-brand/70 max-w-2xl lg:mx-0 mx-auto font-inter leading-relaxed text-sm">
            Explore our curated selection of premium {categoryName.toLowerCase()} pieces, 
            each designed with meticulous attention to detail and crafted for an impeccable fit.
          </p>
        </div>
        <AnimatePresence mode="wait">
          {!isFilterOrSortActive && initialSections.length > 0 ? (
            <motion.div
              key="carousel-sections"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {initialSections.map((section) => (
                <ProductCarousel
                  key={section.id}
                  title={section.title}
                  products={section.products}
                />
              ))}
            </motion.div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <motion.div
              key="grid-layout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {isFilterOrSortActive && (
                <div className="flex items-center justify-between border-b border-brand/5 pb-2">
                  <span className="text-xs font-bold text-brand/60 uppercase tracking-widest flex items-center gap-1.5">
                    <SlidersHorizontal size={12} />
                    Found {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs font-bold text-brand/60 uppercase tracking-widest flex items-center gap-1.5">
                    <LayoutGrid size={12} />
                    Grid View
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
                {paginatedProducts.map((p) => {
                  const parsedImagesList = getProductImageUrls(p.images, p.colors);
                  const firstImage = getFirstProductImageUrl(p.images, p.colors);

                  const productProps = {
                    id: String(p.id),
                    name: p.name,
                    description: p.description || "",
                    price: p.salePrice || p.basePrice,
                    basePrice: p.basePrice,
                    salePrice: p.salePrice ?? undefined,
                    imageUrl: firstImage,
                    images: parsedImagesList,
                    categorySlug: slug,
                    isCustomizable: p.isCustomizable ?? undefined,
                  };
                  return <ProductCard key={p.id} product={productProps} />;
                })}
              </div>

              {/* Global Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-10 pt-8 border-t border-brand/5">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-brand/10 text-xs font-bold text-brand hover:bg-brand/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
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
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-brand text-[#C5A059] shadow-md scale-105"
                            : "border border-brand/10 text-brand hover:bg-brand/5"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-brand/10 text-xs font-bold text-brand hover:bg-brand/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="no-items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center bg-brand/5 rounded-[2.5rem] border border-brand/10 px-8"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <SlidersHorizontal className="text-[#C5A059]" size={24} />
              </div>
              <h2 className="text-xl font-playfair font-bold text-brand mb-2">No Matching Products</h2>
              <p className="text-brand/60 max-w-sm mx-auto text-sm mb-6">
                We couldn't find any products matching your active filters. Try clearing your filters to see all available items.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-brand text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-2xl hover:bg-brand-hover shadow-md transition-all duration-300"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
