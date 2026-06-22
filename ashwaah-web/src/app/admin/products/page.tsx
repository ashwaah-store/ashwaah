"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Package, Trash2, Edit3, X, Star, Loader2, Check, Tag, Sparkles, Search, Scissors, Upload } from "lucide-react";
import { MALE_MEASUREMENTS, FEMALE_MEASUREMENTS } from "@/constants/measurements";

const SIZE_SYSTEMS = {
  apparel: {
    label: "Standard Apparel (S/M/L)",
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]
  },
  waist: {
    label: "Pants / Waist (Numeric)",
    sizes: ["28", "30", "32", "34", "36", "38", "40"]
  },
  footwear: {
    label: "Footwear UK Sizes (Shoes/Flip Flops)",
    sizes: ["5", "6", "7", "8", "9", "10", "11", "12"]
  },
  oneSize: {
    label: "Free Size (One Size)",
    sizes: ["One Size"]
  },
  standard: {
    label: "No Size (Watches, Bags, Accessories)",
    sizes: ["Standard"]
  }
};

const inferSizeSystem = (sizes: string[]): keyof typeof SIZE_SYSTEMS => {
  if (sizes.includes("One Size")) return "oneSize";
  if (sizes.includes("Standard")) return "standard";
  if (sizes.some(s => SIZE_SYSTEMS.waist.sizes.includes(s))) return "waist";
  if (sizes.some(s => SIZE_SYSTEMS.footwear.sizes.includes(s))) return "footwear";
  return "apparel";
};

const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Forest Green", hex: "#1B3022" },
  { name: "Maroon", hex: "#800000" },
  { name: "Beige", hex: "#F5F0E8" },
  { name: "Gold", hex: "#C5A059" },
  { name: "Red", hex: "#DC2626" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Grey", hex: "#9CA3AF" },
  { name: "Brown", hex: "#92400E" },
];

const DEFAULT_SUGGESTIONS: Record<string, string[]> = {
  men: ["Shirt", "T-Shirt", "Pants & Joggers", "Suits & Blazers", "Ethnic Wear"],
  women: ["Dresses", "Tops & Tees", "Shirts", "Trousers", "Sarees", "Kurtas & Kurtis", "Blazers & Coats"],
  kids: ["T-Shirts", "Shirts", "Pants", "Dresses"],
  unisex: ["Shirt", "T-Shirt", "Pants & Joggers", "Suits & Blazers", "Ethnic Wear"]
};

interface Variation { size: string; color: string; stock: number; sku: string; basePrice: number; salePrice: number; }
interface Product {
  id: number; name: string; description: string | null;
  basePrice: number; salePrice: number; images: string;
  avgRating: number; numReviews: number; category: string | null;
  gender: string | null; totalStock: number;
  isFeatured: boolean | number | null;
  isCustomizable: boolean | number | null;
  enabledMeasurements: string | null;
  tags: string | null;
  style?: string | null;
  fabricComposition?: string | null;
  weave?: string | null;
  neckStyle?: string | null;
  keyWords?: string | null;
  filterCategory?: string | null;
  specifications?: string | null;
}

const LABEL = "block text-[10px] font-black text-brand/40 uppercase tracking-[0.2em] mb-3";
const INPUT = "w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-4 text-sm font-semibold text-brand outline-none transition-all placeholder:text-brand/20";

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockEditingProduct, setStockEditingProduct] = useState<any>(null);
  const [stockVariations, setStockVariations] = useState<Variation[]>([]);

  // ── Form state ──────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("unisex");
  const [category, setCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [navItems, setNavItems] = useState<any[]>([]);
  // Removed overall mrp and salePrice
  const [avgRating, setAvgRating] = useState("4.3");
  const [numReviews, setNumReviews] = useState("1");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [tags, setTags] = useState("");
  const [style, setStyle] = useState("");
  const [fabricComposition, setFabricComposition] = useState("");
  const [weave, setWeave] = useState("");
  const [neckStyle, setNeckStyle] = useState("");
  const [keyWords, setKeyWords] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [specRows, setSpecRows] = useState<{ id: string; key: string; value: string; isCustom: boolean }[]>(() => [
    { id: "style-init", key: "Style", value: "", isCustom: false },
    { id: "fabric-init", key: "Fabric", value: "", isCustom: false },
    { id: "weave-init", key: "Weave", value: "", isCustom: false },
    { id: "neck-style-init", key: "Neck Style", value: "", isCustom: false },
  ]);

  const PRESET_SPEC_KEYS = ["Style", "Fabric", "Weave", "Neck Style"];

  const handleAddPreset = (key: string) => {
    setSpecRows(prev => [
      ...prev,
      { id: Math.random().toString(), key, value: "", isCustom: false }
    ]);
  };

  const handleAddCustom = () => {
    setSpecRows(prev => [
      ...prev,
      { id: Math.random().toString(), key: "", value: "", isCustom: true }
    ]);
  };

  const handleUpdateRow = (id: string, updates: Partial<{ key: string; value: string }>) => {
    setSpecRows(prev => prev.map(row => row.id === id ? { ...row, ...updates } : row));
  };

  const handleRemoveRow = (id: string) => {
    setSpecRows(prev => prev.filter(row => row.id !== id));
  };
  const [enabledMeasurements, setEnabledMeasurements] = useState<string[]>([]);
  const [customMeasurements, setCustomMeasurements] = useState<string[]>([]);
  const [newMeasurementInput, setNewMeasurementInput] = useState("");
  const [pendingColor, setPendingColor] = useState("#C5A059");

  // Images per color
  const [colorImageInputs, setColorImageInputs] = useState<Record<string, string>>({});
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [uploadingColor, setUploadingColor] = useState<Record<string, boolean>>({});

  const getFirstImage = (imagesStr: string | null | undefined) => {
    try {
      if (!imagesStr) return "/images/placeholder.png";
      const parsed = JSON.parse(imagesStr);
      if (Array.isArray(parsed)) {
        return parsed[0] || "/images/placeholder.png";
      }
      const keys = Object.keys(parsed);
      for (const key of keys) {
        if (parsed[key] && parsed[key].length > 0) {
          return parsed[key][0];
        }
      }
      return "/images/placeholder.png";
    } catch {
      return "/images/placeholder.png";
    }
  };

  // Sizes & Colors → Variations
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [sizeSystem, setSizeSystem] = useState<keyof typeof SIZE_SYSTEMS>("apparel");
  const [customSizes, setCustomSizes] = useState<Record<string, string[]>>({
    apparel: [],
    waist: [],
    footwear: [],
    oneSize: [],
    standard: []
  });
  const [customSizeInput, setCustomSizeInput] = useState("");
  

  
  // States and Refs for inline size button reordering
  const [allSizesOrder, setAllSizesOrder] = useState<string[]>([]);
  const [draggedSizeIndex, setDraggedSizeIndex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  // Maintain allSizesOrder in sync with presets + customSizes of selected sizeSystem
  useEffect(() => {
    const presetSizes = SIZE_SYSTEMS[sizeSystem]?.sizes || [];
    const custom = customSizes[sizeSystem] || [];
    const combined = [...presetSizes, ...custom];
    
    setAllSizesOrder(prev => {
      // Filter out any sizes that are not in the new system
      const newSystemSizes = new Set(combined);
      const filteredPrev = prev.filter(s => newSystemSizes.has(s));
      
      // Find sizes in combined that are not in filteredPrev, and append them
      const existing = new Set(filteredPrev);
      const added = combined.filter(s => !existing.has(s));
      
      return [...filteredPrev, ...added];
    });
  }, [sizeSystem, customSizes]);

  // Keep selectedSizes sorted to match the relative order of allSizesOrder
  useEffect(() => {
    if (selectedSizes.length <= 1) return;
    setSelectedSizes(prev => {
      const next = [...prev];
      next.sort((a, b) => allSizesOrder.indexOf(a) - allSizesOrder.indexOf(b));
      if (JSON.stringify(next) === JSON.stringify(prev)) return prev;
      return next;
    });
  }, [allSizesOrder]);

  const handleDragStart = (index: number) => {
    isDraggingRef.current = true;
    setDraggedSizeIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSizeIndex === null || draggedSizeIndex === index) return;
    
    setAllSizesOrder(prev => {
      const nextList = [...prev];
      const draggedItem = nextList[draggedSizeIndex];
      nextList.splice(draggedSizeIndex, 1);
      nextList.splice(index, 0, draggedItem);
      setDraggedSizeIndex(index);
      return nextList;
    });
  };

  const handleDragEnd = () => {
    setDraggedSizeIndex(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handleAddCustomSize = () => {
    const cleanSize = customSizeInput.trim();
    if (!cleanSize) return;

    // Check if it already exists in presets or customs
    const currentSizes = [...(SIZE_SYSTEMS[sizeSystem]?.sizes || []), ...(customSizes[sizeSystem] || [])];
    if (currentSizes.map(s => s.toLowerCase()).includes(cleanSize.toLowerCase())) {
      const existingSizeName = currentSizes.find(s => s.toLowerCase() === cleanSize.toLowerCase()) || cleanSize;
      if (!selectedSizes.includes(existingSizeName)) {
        setSelectedSizes(prev => [...prev, existingSizeName]);
      }
      setCustomSizeInput("");
      return;
    }

    setCustomSizes(prev => ({
      ...prev,
      [sizeSystem]: [...(prev[sizeSystem] || []), cleanSize]
    }));

    setSelectedSizes(prev => [...prev, cleanSize]);
    setCustomSizeInput("");
  };

  useEffect(() => { 
    fetchProducts(); 
    fetchAvailableCategories();
    fetchNavigationItems();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch { } finally { setIsLoading(false); }
  };

  const fetchAvailableCategories = async () => {
    try {
      const resHomeCat = await fetch("/api/admin/homepage-categories");
      const dataHomeCat = await resHomeCat.json();
      const homeCatLabels = dataHomeCat.success ? dataHomeCat.data.map((item: any) => item.name) : [];

      const resNav = await fetch("/api/admin/nav?all=true");
      const dataNav = await resNav.json();
      const navLabels = dataNav.success ? dataNav.data.map((item: any) => item.label) : [];

      const combined = [...homeCatLabels, ...navLabels];
      const uniqueNames = Array.from(new Set(combined))
        .map(name => String(name).trim())
        .filter(name => name !== "")
        .sort((a, b) => a.localeCompare(b));

      setAvailableCategories(uniqueNames);
    } catch (error) {
      console.error("Failed to load categories for dropdown:", error);
    }
  };

  const fetchNavigationItems = async () => {
    try {
      const res = await fetch("/api/admin/nav?all=true");
      const data = await res.json();
      if (data.success) {
        setNavItems(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load navigation items:", error);
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // When sizes or colors change → regenerate variation matrix
  useEffect(() => {
    if (selectedSizes.length === 0 && selectedColors.length === 0) { 
      if (!editingId) setVariations([]); 
      return; 
    }
    const sizesToUse = selectedSizes.length ? selectedSizes : ["Default"];
    const colorsToUse = selectedColors.length ? selectedColors : ["Default"];
    
    setVariations(prev => {
      const newVariations = [...prev];
      sizesToUse.forEach(size => {
        colorsToUse.forEach(color => {
          const exists = newVariations.find(v => v.size === size && v.color === color);
          if (!exists) {
            newVariations.push({ size, color, stock: 0, sku: "", basePrice: 0, salePrice: 0 });
          }
        });
      });
      // Filter out variations where the size or color is no longer selected
      const filtered = newVariations.filter(v => 
        (sizesToUse.includes(v.size) || (v.size === "Default" && selectedSizes.length === 0)) &&
        (colorsToUse.includes(v.color) || (v.color === "Default" && selectedColors.length === 0))
      );

      // Sort variations to match the order of selectedSizes and selectedColors
      filtered.sort((a, b) => {
        const sizeIndexA = sizesToUse.indexOf(a.size);
        const sizeIndexB = sizesToUse.indexOf(b.size);
        if (sizeIndexA !== sizeIndexB) {
          return sizeIndexA - sizeIndexB;
        }
        
        const colorIndexA = colorsToUse.indexOf(a.color);
        const colorIndexB = colorsToUse.indexOf(b.color);
        return colorIndexA - colorIndexB;
      });

      return filtered;
    });
  }, [selectedSizes, selectedColors, editingId]);


  const totalStock = useMemo(() => variations.reduce((a, v) => a + (Number(v.stock) || 0), 0), [variations]);
  // Overall discount display removed as pricing is now per variation

  const toggleSize = (s: string) => setSelectedSizes(prev => {
    if (prev.includes(s)) {
      return prev.filter(x => x !== s);
    } else {
      const next = [...prev, s];
      next.sort((a, b) => allSizesOrder.indexOf(a) - allSizesOrder.indexOf(b));
      return next;
    }
  });
  const toggleColor = (c: string) => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleMeasurement = (m: string) => setEnabledMeasurements(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const updateVariation = (size: string, color: string, field: keyof Variation, value: string | number) =>
    setVariations(prev => prev.map(v => v.size === size && v.color === color ? { ...v, [field]: value } : v));

  const addColorImage = (color: string) => {
    const inputVal = colorImageInputs[color]?.trim();
    if (inputVal) {
      setColorImages(prev => ({
        ...prev,
        [color]: [...(prev[color] || []), inputVal]
      }));
      setColorImageInputs(prev => ({
        ...prev,
        [color]: ""
      }));
    }
  };

  const handleUploadImageForColor = async (e: React.ChangeEvent<HTMLInputElement>, color: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingColor(prev => ({ ...prev, [color]: true }));
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setColorImageInputs(prev => ({ ...prev, [color]: data.url }));
        showToast("Image uploaded to Cloudinary!");
      } else {
        showToast(data.error || "Upload failed.");
      }
    } catch (err) {
      showToast("Error uploading image.");
    } finally {
      setUploadingColor(prev => ({ ...prev, [color]: false }));
      e.target.value = "";
    }
  };

  const removeColorImage = (color: string, indexToRemove: number) => {
    setColorImages(prev => ({
      ...prev,
      [color]: (prev[color] || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setName(""); setDescription(""); setGender("unisex"); setCategory("");
    setAvgRating("4.3"); setNumReviews("1");
    setIsFeatured(false); setIsCustomizable(false); setTags("");
    setStyle(""); setFabricComposition(""); setWeave(""); setNeckStyle(""); setKeyWords(""); setFilterCategory("");
    setSpecRows([
      { id: Math.random().toString(), key: "Style", value: "", isCustom: false },
      { id: Math.random().toString(), key: "Fabric", value: "", isCustom: false },
      { id: Math.random().toString(), key: "Weave", value: "", isCustom: false },
      { id: Math.random().toString(), key: "Neck Style", value: "", isCustom: false },
    ]);
    setColorImages({});
    setColorImageInputs({});
    setSelectedSizes([]); setSelectedColors([]); setVariations([]);
    setSizeSystem("apparel");
    setCustomSizes({
      apparel: [],
      waist: [],
      footwear: [],
      oneSize: [],
      standard: []
    });
    setCustomSizeInput("");
    setEnabledMeasurements([]);
    setCustomMeasurements([]);
    setNewMeasurementInput("");
  };

  const handleEdit = async (id: number) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`);
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setEditingId(p.id);
        
        // Clear previous custom sizes
        setCustomSizes({
          apparel: [],
          waist: [],
          footwear: [],
          oneSize: [],
          standard: []
        });

        setName(p.name);
        setDescription(p.description || "");
        setGender(p.gender || "unisex");
        setCategory(p.category || "");
        // mrp and salePrice are now in variations
        setAvgRating((p.avgRating ?? 4.3).toString());
        setNumReviews((p.numReviews ?? 1).toString());
        setIsFeatured(!!p.isFeatured);
        setIsCustomizable(!!p.isCustomizable);
        setTags(p.tags || "");
        setStyle(p.style || "");
        setFabricComposition(p.fabricComposition || "");
        setWeave(p.weave || "");
        setNeckStyle(p.neckStyle || "");
        setKeyWords(p.keyWords || "");
        
        setFilterCategory(p.filterCategory || "");

        // Parse specifications
        let specs: Record<string, string> = {};
        if (p.specifications) {
          try {
            specs = JSON.parse(p.specifications);
          } catch (e) {
            console.error("Failed to parse specifications:", e);
          }
        } else {
          // Fallback to legacy fields
          if (p.style) specs["Style"] = p.style;
          if (p.fabricComposition) specs["Fabric"] = p.fabricComposition;
          if (p.weave) specs["Weave"] = p.weave;
          if (p.neckStyle) specs["Neck Style"] = p.neckStyle;
        }

        const rows = Object.entries(specs).map(([k, v]) => ({
          id: Math.random().toString(),
          key: k,
          value: v,
          isCustom: !PRESET_SPEC_KEYS.includes(k)
        }));
        setSpecRows(rows);
        
        let parsedImages: Record<string, string[]> = {};
        try {
          const raw = JSON.parse(p.images || "[]");
          if (Array.isArray(raw)) {
            const itemColors = p.variations
              ? Array.from(new Set(p.variations.map((v: any) => v.color))).filter(c => c && c !== "Default") as string[]
              : [];
            if (itemColors.length > 0) {
              parsedImages[itemColors[0]] = raw;
            } else {
              parsedImages["Default"] = raw;
            }
          } else {
            parsedImages = raw;
          }
        } catch {
          parsedImages = {};
        }
        setColorImages(parsedImages);
        setColorImageInputs({});
        
        // Handle variations
        if (p.variations) {
          const sizes = Array.from(new Set(p.variations.map((v: any) => v.size))).filter(s => s !== "Default") as string[];
          const colors = Array.from(new Set(p.variations.map((v: any) => v.color))).filter(c => c !== "Default") as string[];
          
          const system = inferSizeSystem(sizes);
          setSizeSystem(system);
          
          const presetSizes = SIZE_SYSTEMS[system]?.sizes || [];
          const loadedCustomSizes = sizes.filter(s => !presetSizes.includes(s));
          if (loadedCustomSizes.length > 0) {
            setCustomSizes(prev => ({
              ...prev,
              [system]: loadedCustomSizes
            }));
          }
          
          const remainingPresets = presetSizes.filter(s => !sizes.includes(s));
          setAllSizesOrder([...sizes, ...remainingPresets]);
          
          setSelectedSizes(sizes);
          setSelectedColors(colors);
          setVariations(p.variations);
        }

        if (p.enabledMeasurements) {
          try {
            const enabled = JSON.parse(p.enabledMeasurements);
            setEnabledMeasurements(enabled);
            
            // Extract custom ones
            const presets = p.gender === "men" ? MALE_MEASUREMENTS : FEMALE_MEASUREMENTS;
            const custom = enabled.filter((m: string) => !presets.includes(m));
            setCustomMeasurements(custom);
          } catch {
            setEnabledMeasurements([]);
            setCustomMeasurements([]);
          }
        } else {
          setEnabledMeasurements([]);
          setCustomMeasurements([]);
        }
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch { showToast("Failed to load product details."); } finally { setIsSubmitting(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return showToast("Product name is required.");
    
    // Check images count across active colors
    const activeColors = selectedColors.length > 0 ? selectedColors : ["Default"];
    const totalImagesCount = activeColors.reduce((sum, color) => sum + (colorImages[color]?.length || 0), 0);
    if (totalImagesCount < 1) return showToast("Add at least 1 image URL.");
    
    if (selectedColors.length > 0) {
      const missingImagesColor = selectedColors.find(color => !colorImages[color] || colorImages[color].length === 0);
      if (missingImagesColor) {
        return showToast(`Please add at least 1 image for color: ${missingImagesColor}`);
      }
    } else {
      if (!colorImages["Default"] || colorImages["Default"].length === 0) {
        return showToast("Please add at least 1 image.");
      }
    }

    if (variations.length === 0) return showToast("Please add at least one size/color variation.");
    const emptyVariation = variations.find(v => !v.basePrice || !v.salePrice);
    if (emptyVariation) return showToast(`Please provide prices for: ${emptyVariation.size} / ${emptyVariation.color}`);
    
    const overpricedVariation = variations.find(v => Number(v.salePrice) >= Number(v.basePrice));
    if (overpricedVariation) return showToast(`Sale Price must be LOWER than Base Price for: ${overpricedVariation.size} / ${overpricedVariation.color}`);

    // Construct clean images object matching active colors
    const imagesToSave: Record<string, string[]> = {};
    if (selectedColors.length > 0) {
      selectedColors.forEach(color => {
        imagesToSave[color] = colorImages[color] || [];
      });
    } else {
      imagesToSave["Default"] = colorImages["Default"] || [];
    }

    setIsSubmitting(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      // Convert specRows back to specifications JSON object
      const specsObj: Record<string, string> = {};
      specRows.forEach(row => {
        const cleanKey = row.key.trim();
        const cleanVal = row.value.trim();
        if (cleanKey && cleanVal) {
          specsObj[cleanKey] = cleanVal;
        }
      });

      const payload = { 
        id: editingId, name, description, images: imagesToSave, variations, 
        avgRating, numReviews, category, gender, colors: selectedColors, tags, isFeatured,
        isCustomizable,
        enabledMeasurements: JSON.stringify(enabledMeasurements),
        style: null, fabricComposition: null, weave: null, neckStyle: null, keyWords: null,
        filterCategory: filterCategory ? filterCategory.trim() : null,
        specifications: specsObj
      };
      
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { 
        showToast(editingId ? "✓ Product updated!" : "✓ Product added to store!"); 
        fetchProducts(); 
        resetForm(); 
      }
      else showToast(data.details || data.error || "Failed to save product.");
    } catch (err: any) { showToast(err.message || "Network error."); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Product deleted successfully.");
        fetchProducts();
        if (editingId === id) resetForm();
      } else {
        showToast(data.error || "Failed to delete product.");
      }
    } catch { showToast("Network error."); }
  };

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockEditingProduct) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: stockEditingProduct.id, 
          name: stockEditingProduct.name,
          variations: stockVariations 
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Stock updated successfully!");
        fetchProducts();
        setStockModalOpen(false);
      } else {
        showToast(data.error || "Failed to update stock");
      }
    } catch {
      showToast("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStockModal = async (product: Product) => {
    setStockEditingProduct(product);
    setStockModalOpen(true);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`);
      const data = await res.json();
      if (data.success) {
        setStockVariations(data.data.variations || []);
      }
    } catch {
      showToast("Failed to load variations.");
      setStockModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full overflow-hidden">
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#1B3022] text-[#C5A059] px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 font-bold text-sm">
          <Check size={18} /><span>{toast}</span>
        </div>
      )}

      {/* ─── QUICK STOCK MODAL ────────────────────────── */}
      {stockModalOpen && stockEditingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand/40 backdrop-blur-sm" onClick={() => !isSubmitting && setStockModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-brand/5 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-brand/5 flex items-center justify-between bg-brand/5">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-brand/10">
                  <img src={getFirstImage(stockEditingProduct.images)} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-playfair font-bold text-brand">Quick Stock Update</h2>
                  <p className="text-[10px] font-black text-brand/30 uppercase tracking-widest">{stockEditingProduct.name}</p>
                </div>
              </div>
              <button onClick={() => setStockModalOpen(false)} className="p-2 hover:bg-brand/10 rounded-xl transition-all">
                <X size={20} className="text-brand/40" />
              </button>
            </div>

            <form onSubmit={handleStockUpdate} className="p-8">
              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 mb-8">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black text-brand/30 uppercase tracking-widest">
                    <tr>
                      <th className="pb-4 px-2">Variation</th>
                      <th className="pb-4 px-2">Current Stock</th>
                      <th className="pb-4 px-2">New Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand/5">
                    {stockVariations.map((v, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-brand">{v.size}</span>
                            {v.color && v.color !== "Default" && (
                              <div className="flex items-center space-x-1.5 bg-brand/5 px-2 py-0.5 rounded-full">
                                <div className="w-2 h-2 rounded-full border border-white" style={{ backgroundColor: v.color.startsWith("#") ? v.color : PRESET_COLORS.find(c => c.name === v.color)?.hex }} />
                                <span className="text-[9px] font-bold text-brand/60 uppercase">{v.color}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`text-xs font-black ${v.stock < 10 ? "text-red-500" : "text-brand/40"}`}>{v.stock}</span>
                        </td>
                        <td className="py-4 px-2">
                          <input 
                            type="number" 
                            min="0"
                            value={v.stock}
                            onChange={(e) => {
                              const newVal = parseInt(e.target.value) || 0;
                              setStockVariations(prev => prev.map((item, i) => i === idx ? { ...item, stock: newVal } : item));
                            }}
                            className="w-24 bg-brand/5 border-2 border-transparent focus:border-brand-accent/30 rounded-xl px-4 py-2 text-xs font-black text-brand outline-none transition-all"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setStockModalOpen(false)}
                  className="flex-1 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-brand/40 hover:bg-brand/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] bg-brand text-brand-accent px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:shadow-brand/20 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  <span>Save Stock Levels</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex h-full w-full overflow-hidden">
        
        {/* ─── LEFT: FORM (Middle Workspace) ────────────────────────── */}
        <div className="flex-[3] h-full overflow-y-auto custom-scrollbar p-4 md:p-6 border-r border-brand/5">
          <div className="flex flex-col items-center text-center justify-center mb-6 pt-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-[#C5A059]/10 rounded-xl w-fit">
                {editingId ? <Edit3 className="text-[#C5A059]" size={22} /> : <Plus className="text-[#C5A059]" size={22} />}
              </div>
              <div>
                <h1 className="text-3xl font-playfair font-bold text-brand">{editingId ? "Edit Product" : "Add New Product"}</h1>
                <p className="text-brand/40 text-xs font-medium mt-1">
                  {editingId ? `Updating product ID: ${editingId}` : "Fill in the details below to list a new item"}
                </p>
              </div>
            </div>
            {editingId && (
              <button onClick={resetForm} className="mt-4 px-4 py-2 bg-brand/5 text-brand/40 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand/10 transition-all">
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-brand/5 space-y-8">

            {/* ── Section 1: Identity ── */}
            <div>
              <h3 className="text-xs font-black text-brand/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-brand text-white text-[8px] flex items-center justify-center font-black">1</span> Product Identity</h3>
              <div className="space-y-5">
                <div>
                  <label className={LABEL}>Product Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kerala Cotton Kasavu Nighty" className={INPUT} required />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={LABEL}>Gender *</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className={INPUT}>
                      <option value="unisex">Unisex</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Category *</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className={INPUT}
                      required
                    >
                      <option value="">Select Category...</option>
                      {availableCategories.map((catName) => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Fabric, style, size details…" rows={3} className={`${INPUT} resize-none`} />
                </div>
                <div>
                  <label className={LABEL}>Tags (comma-separated)</label>
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="cotton, festive, handloom, bestseller…" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Filter Category (Sidebar Category Filter Name)</label>
                  <input
                    type="text"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    placeholder="e.g. Shirts, Blazers & Coats, Trousers"
                    className={INPUT}
                  />
                  <p className="mt-1.5 text-[10px] text-brand/50 font-medium leading-relaxed">
                    Determines which checkbox option in the storefront's sidebar categories filter this product belongs to. Type any custom category (e.g. Blazers & Coats).
                  </p>
                </div>

                {/* Optional & Custom Specifications Dynamic Editor */}
                <div className="border-t border-brand/10 pt-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <div>
                      <h4 className="text-xs font-black text-brand uppercase tracking-wider">Product Specifications</h4>
                      <p className="text-[10px] text-brand/40 font-medium mt-0.5">Optional properties and custom specifications for this product.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {PRESET_SPEC_KEYS.filter(k => !specRows.some(r => r.key.toLowerCase() === k.toLowerCase())).length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddPreset(e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="bg-brand/5 border border-brand/10 hover:border-[#C5A059]/40 rounded-xl px-3 py-1.5 text-xs font-bold text-brand outline-none transition-all cursor-pointer"
                        >
                          <option value="">+ Add Preset Specification...</option>
                          {PRESET_SPEC_KEYS
                            .filter(k => !specRows.some(r => r.key.toLowerCase() === k.toLowerCase()))
                            .map(k => (
                              <option key={k} value={k}>{k}</option>
                            ))
                          }
                        </select>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleAddCustom}
                        className="bg-brand/5 border border-brand/10 hover:border-[#C5A059]/40 hover:bg-[#C5A059]/10 rounded-xl px-3 py-1.5 text-xs font-bold text-brand transition-all flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Custom Attribute
                      </button>
                    </div>
                  </div>
                  
                  {specRows.length === 0 ? (
                    <div className="bg-brand/5 rounded-2xl p-6 text-center border border-dashed border-brand/10">
                      <p className="text-xs text-brand/40 font-medium">No specifications added yet. Add style, fabric, or other attributes above.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {specRows.map((row) => (
                        <div key={row.id} className="flex gap-3 items-center bg-brand/5 p-3 rounded-2xl border border-brand/5">
                          <div className="w-1/3">
                            <input
                              type="text"
                              value={row.key}
                              onChange={(e) => handleUpdateRow(row.id, { key: e.target.value })}
                              placeholder="Attribute Name"
                              disabled={!row.isCustom}
                              className={`w-full bg-brand/5 border border-transparent rounded-xl px-3 py-2 text-xs font-bold text-brand outline-none ${
                                !row.isCustom ? "opacity-60 cursor-not-allowed bg-transparent" : "focus:border-[#C5A059]/30"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={row.value}
                              onChange={(e) => handleUpdateRow(row.id, { value: e.target.value })}
                              placeholder={`Value for ${row.key || "attribute"}`}
                              className="w-full bg-[#FFFDF6] border border-brand/10 focus:border-[#C5A059]/30 rounded-xl px-3 py-2 text-xs font-semibold text-brand outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-2 text-brand/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Remove attribute"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-6 bg-brand/5 rounded-[2.5rem] border border-brand/10 transition-all hover:bg-brand/[0.08]">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl transition-all ${isFeatured ? "bg-brand-accent/20 text-brand-accent" : "bg-brand/10 text-brand/30"}`}>
                      <Sparkles size={20} className={isFeatured ? "animate-pulse" : ""} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-brand uppercase tracking-widest">Featured Product</p>
                      <p className="text-[10px] text-brand/40 font-medium">Spotlight this item on the homepage</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsFeatured(!isFeatured)} 
                    className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 ${isFeatured ? "bg-brand-accent shadow-[0_0_15px_rgba(197,160,89,0.3)]" : "bg-brand/20"}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform duration-300 ease-out ${isFeatured ? "translate-x-7" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Section 2: Customization Settings ── */}
            <div>
              <h3 className="text-xs font-black text-brand/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand text-white text-[8px] flex items-center justify-center font-black">2</span> 
                Customization Settings
              </h3>
              <div className="bg-brand/5 rounded-[2.5rem] p-8 border border-brand/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-brand/10 rounded-2xl text-brand">
                      <Scissors size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-brand uppercase tracking-widest">Enable Custom Fit</p>
                      <p className="text-[10px] text-brand/40 font-medium">Allow users to provide bespoke measurements for this product</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsCustomizable(!isCustomizable)} 
                    className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 ${isCustomizable ? "bg-brand-accent shadow-[0_0_15px_rgba(197,160,89,0.3)]" : "bg-brand/20"}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform duration-300 ease-out ${isCustomizable ? "translate-x-7" : "translate-x-0"}`} />
                  </button>
                </div>

                {isCustomizable && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-brand/40 uppercase tracking-widest mb-4 border-b border-brand/5 pb-2">Select measurements to capture from user</p>
                    </div>
                    {gender === "unisex" ? (
                      <div className="py-8 text-center text-brand/30 bg-white/50 rounded-2xl border border-dashed border-brand/10">
                        <p className="text-[10px] font-bold uppercase tracking-widest">Please select Men or Women gender to configure measurements</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Array.from(new Set([
                            ...(gender === "men" ? MALE_MEASUREMENTS : FEMALE_MEASUREMENTS),
                            ...customMeasurements
                          ])).map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => toggleMeasurement(m)}
                              className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all ${
                                enabledMeasurements.includes(m)
                                  ? "bg-brand text-white border-brand shadow-lg"
                                  : "bg-white text-brand/60 border-brand/5 hover:border-brand/20"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                enabledMeasurements.includes(m) ? "bg-white border-white text-brand" : "bg-brand/5 border-brand/10"
                              }`}>
                                {enabledMeasurements.includes(m) && <Check size={12} strokeWidth={4} />}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest truncate">{m}</span>
                            </button>
                          ))}
                        </div>

                        {/* Add Custom Measurement Button/Input */}
                        <div className="flex items-center gap-3 p-4 bg-white/50 rounded-2xl border border-brand/10 border-dashed">
                          <input 
                            type="text"
                            value={newMeasurementInput}
                            onChange={(e) => setNewMeasurementInput(e.target.value)}
                            placeholder="Add custom measurement (e.g. Belt Size)..."
                            className="flex-1 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest outline-none placeholder:text-brand/20"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (newMeasurementInput.trim()) {
                                  setCustomMeasurements(prev => [...prev, newMeasurementInput.trim()]);
                                  setEnabledMeasurements(prev => [...prev, newMeasurementInput.trim()]);
                                  setNewMeasurementInput("");
                                }
                              }
                            }}
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              if (newMeasurementInput.trim()) {
                                setCustomMeasurements(prev => [...prev, newMeasurementInput.trim()]);
                                setEnabledMeasurements(prev => [...prev, newMeasurementInput.trim()]);
                                setNewMeasurementInput("");
                              }
                            }}
                            className="p-2 bg-brand text-white rounded-lg hover:scale-110 transition-transform shadow-md"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {enabledMeasurements.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-brand/10 flex items-center justify-between">
                        <span className="text-[10px] font-black text-brand/40 uppercase tracking-widest">Total Enabled: {enabledMeasurements.length}</span>
                        <button type="button" onClick={() => setEnabledMeasurements([])} className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Clear All</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 3: Inventory Overview ── */}
            <div>
              <h3 className="text-xs font-black text-brand/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-brand text-white text-[8px] flex items-center justify-center font-black">3</span> Inventory Overview</h3>
              <div className="p-5 bg-brand/5 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-black text-brand/40 uppercase tracking-widest">Total Combined Stock (All variations)</span>
                <span className="text-2xl font-black text-brand">{totalStock}</span>
              </div>
            </div>

            {/* ── Section 4: Available Sizes ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-brand/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand text-white text-[8px] flex items-center justify-center font-black">4</span> 
                Available Sizes
              </h3>
              
              <div>
                <label className="block text-[10px] font-black text-brand/40 uppercase tracking-[0.2em] mb-2">
                  Select Size Chart System
                </label>
                <select
                  value={sizeSystem}
                  onChange={(e) => {
                    const newSystem = e.target.value as keyof typeof SIZE_SYSTEMS;
                    setSizeSystem(newSystem);
                    if (newSystem === "oneSize") {
                      setSelectedSizes(["One Size"]);
                    } else if (newSystem === "standard") {
                      setSelectedSizes(["Standard"]);
                    } else {
                      setSelectedSizes([]);
                    }
                  }}
                  className="bg-brand/5 border border-transparent focus:border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs font-semibold text-brand outline-none transition-all w-full max-w-xs cursor-pointer"
                >
                  {Object.entries(SIZE_SYSTEMS).map(([key, system]) => (
                    <option key={key} value={key}>
                      {system.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap gap-2">
                  {allSizesOrder.map((size, idx) => (
                    <button 
                      key={size} 
                      type="button" 
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (isDraggingRef.current) return;
                        toggleSize(size);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border select-none cursor-grab active:cursor-grabbing ${
                        selectedSizes.includes(size) 
                          ? "bg-[#1B3022] text-white border-[#1B3022]" 
                          : "bg-brand/5 text-brand/50 border-transparent hover:border-brand/20"
                      } ${draggedSizeIndex === idx ? "opacity-40 scale-95 border-brand-accent" : ""}`}
                      title="Drag to rearrange size order"
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Add Custom Size Input and Plus Button */}
                <div className="flex items-center gap-3 p-3 bg-brand/5 rounded-2xl border border-brand/10 border-dashed max-w-xs">
                  <input 
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="Add custom (e.g. XXS)..."
                    className="flex-1 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest outline-none placeholder:text-brand/20 text-brand"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={handleAddCustomSize}
                    className="p-1.5 bg-brand rounded-lg hover:scale-105 transition-all shadow-sm cursor-pointer flex items-center justify-center"
                  >
                    <Plus size={12} className="text-[#C5A059]" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Section 5: Available Colors ── */}
            <div>
              <h3 className="text-xs font-black text-brand/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand text-white text-[8px] flex items-center justify-center font-black">5</span> 
                Available Colors
              </h3>
              <div className="space-y-6">
                {/* Preset Colors */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColor(color.name)}
                      className={`group relative flex flex-col items-center space-y-2 p-3 rounded-2xl border transition-all ${
                        selectedColors.includes(color.name) 
                          ? "bg-brand border-brand shadow-lg scale-105" 
                          : "bg-white border-brand/5 hover:border-brand/20"
                      }`}
                    >
                      <div 
                        className={`w-8 h-8 rounded-full border border-black/5 shadow-inner transition-transform group-hover:scale-110 ${selectedColors.includes(color.name) ? "ring-2 ring-white ring-offset-2 ring-offset-brand" : ""}`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className={`text-[8px] font-black uppercase tracking-tighter text-center line-clamp-1 ${selectedColors.includes(color.name) ? "text-white" : "text-brand/40"}`}>
                        {color.name}
                      </span>
                      {selectedColors.includes(color.name) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent text-white rounded-full flex items-center justify-center shadow-md">
                          <Check size={8} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center space-x-6 p-6 bg-brand/5 rounded-[2rem] border border-brand/10">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-3">Custom Color Picker</p>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={pendingColor}
                          onChange={(e) => setPendingColor(e.target.value.toUpperCase())}
                          className="w-14 h-14 p-1 bg-white border border-brand/20 rounded-2xl cursor-pointer shadow-sm hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: pendingColor }} />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <input 
                          type="text" 
                          value={pendingColor}
                          onChange={(e) => setPendingColor(e.target.value.toUpperCase())}
                          placeholder="#C5A059" 
                          className="w-full bg-white border border-brand/10 rounded-xl px-4 py-2 text-xs font-black text-brand uppercase tracking-widest focus:border-brand-accent outline-none transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            if (!selectedColors.includes(pendingColor)) {
                              if (window.confirm(`Add color ${pendingColor} to this product's variations?`)) {
                                toggleColor(pendingColor);
                              }
                            } else {
                              showToast("Color already selected");
                            }
                          }}
                          className="w-full bg-[#1B3022] text-[#C5A059] py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2c4d37] transition-all shadow-md active:scale-95"
                        >
                          Add Color to Matrix
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-brand/10" />
                  <div className="hidden md:block flex-1">
                    <p className="text-[9px] text-brand/30 font-medium leading-relaxed italic">
                      Pick a shade and click "Add Color" to confirm. This will generate new size variations in the matrix below.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 6: Color-Specific Images ── */}
            <div>
              <h3 className="text-xs font-black text-brand/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand text-white text-[8px] flex items-center justify-center font-black">6</span> 
                Color-Specific Images
              </h3>
              
              <div className="space-y-6">
                {(selectedColors.length > 0 ? selectedColors : ["Default"]).map((color) => {
                  const currentImages = colorImages[color] || [];
                  const currentInput = colorImageInputs[color] || "";
                  const colorPreset = PRESET_COLORS.find(c => c.name === color);
                  
                  return (
                    <div key={color} className="p-6 bg-brand/5 rounded-[2.5rem] border border-brand/10 space-y-4">
                      <div className="flex items-center space-x-3 pb-2 border-b border-brand/5">
                        {color !== "Default" && (
                          <div 
                            className="w-4 h-4 rounded-full border border-black/10"
                            style={{ backgroundColor: color.startsWith("#") ? color : colorPreset?.hex }}
                          />
                        )}
                        <span className="text-xs font-black text-brand uppercase tracking-wider">
                          {color === "Default" ? "Default Images" : `${color} Images`} ({currentImages.length})
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex flex-1 gap-3">
                          <input 
                            value={currentInput} 
                            onChange={e => setColorImageInputs(prev => ({ ...prev, [color]: e.target.value }))} 
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addColorImage(color);
                              }
                            }} 
                            placeholder="Paste URL or upload image →" 
                            className={`${INPUT} flex-1`} 
                          />
                          <button 
                            type="button" 
                            onClick={() => addColorImage(color)} 
                            className="bg-[#1B3022] text-[#C5A059] px-5 py-2 rounded-2xl font-bold text-xs hover:bg-[#2c4d37] transition-all whitespace-nowrap"
                          >
                            Add URL
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer bg-[#C5A059] text-white px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-[#B38E46] transition-all whitespace-nowrap flex items-center justify-center gap-1.5 shadow-sm">
                            {uploadingColor[color] ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={14} />
                                <span>Upload Image</span>
                              </>
                            )}
                            <input 
                              type="file"
                              accept="image/*"
                              disabled={!!uploadingColor[color]}
                              onChange={e => handleUploadImageForColor(e, color)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                      
                      {currentImages.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {currentImages.map((img, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-brand/10 group">
                              <img src={img} alt={`${color}-img-${i}`} className="w-full h-full object-cover" onError={e => (e.currentTarget.src = "/images/placeholder.png")} />
                              <button 
                                type="button" 
                                onClick={() => removeColorImage(color, i)} 
                                className="absolute inset-0 bg-red-500/80 text-white items-center justify-center hidden group-hover:flex"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-dashed border-brand/10 bg-white/50 rounded-2xl py-6 text-center text-brand/30">
                          <p className="text-[10px] font-black uppercase tracking-widest">No images added for this color</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>


            {/* ── Section 7: Variation Matrix ── */}
            <div>
              <h3 className="text-xs font-black text-brand/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-brand text-white text-[8px] flex items-center justify-center font-black">7</span> Variation Matrix (Stock & SKU)</h3>
              {variations.length > 0 ? (
                <div className="overflow-hidden rounded-[2rem] border border-brand/5 shadow-sm">
                  <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand text-white/60 font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-5 py-4">Size</th>
                        <th className="px-5 py-4">Color</th>
                        <th className="px-5 py-4">Base Price (₹)</th>
                        <th className="px-5 py-4">Sale (₹)</th>
                        <th className="px-5 py-4">Stock</th>
                        <th className="px-5 py-4">SKU</th>
                        <th className="px-5 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand/5">
                      {variations.map((v, idx) => (
                        <tr key={`${v.size}-${v.color}-${idx}`} className="hover:bg-brand/5 transition-colors">
                          <td className="px-5 py-3 font-bold text-brand">{v.size}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center space-x-2">
                              {v.color && v.color !== "Default" && <span className="w-3 h-3 rounded-full border border-white shadow" style={{ backgroundColor: v.color.startsWith("#") ? v.color : PRESET_COLORS.find(c => c.name === v.color)?.hex }} />}
                              <span className="text-brand/60 font-medium">{v.color && v.color !== "Default" ? v.color : "—"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <input 
                              type="number" 
                              value={v.basePrice ?? ""} 
                              onChange={e => updateVariation(v.size, v.color, "basePrice", e.target.value === "" ? "" : parseFloat(e.target.value))} 
                              className="w-20 bg-brand/5 border border-transparent focus:border-[#C5A059]/40 rounded-lg px-3 py-2 text-xs font-bold outline-none" 
                              placeholder="1000" 
                            />
                          </td>
                          <td className="px-5 py-3">
                            <input 
                              type="number" 
                              value={v.salePrice ?? ""} 
                              onChange={e => updateVariation(v.size, v.color, "salePrice", e.target.value === "" ? "" : parseFloat(e.target.value))} 
                              className={`w-20 border transition-all rounded-lg px-3 py-2 text-xs font-bold outline-none ${
                                v.salePrice && v.basePrice && Number(v.salePrice) >= Number(v.basePrice)
                                  ? "bg-red-50 border-red-200 text-red-600 focus:border-red-400" 
                                  : "bg-brand/5 border-transparent focus:border-[#C5A059]/40 text-green-600"
                              }`} 
                              placeholder="699" 
                            />
                            {v.basePrice && v.salePrice && Number(v.salePrice) < Number(v.basePrice) && (
                              <span className="block text-[9px] font-bold text-green-600 mt-1 pl-1">
                                {Math.round((1 - Number(v.salePrice) / Number(v.basePrice)) * 100)}% OFF
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <input type="number" value={v.stock ?? ""} onChange={e => updateVariation(v.size, v.color, "stock", e.target.value === "" ? "" : parseInt(e.target.value))} className="w-16 bg-brand/5 border border-transparent focus:border-[#C5A059]/40 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                          </td>
                          <td className="px-5 py-3">
                            <input type="text" value={v.sku ?? ""} onChange={e => updateVariation(v.size, v.color, "sku", e.target.value)} placeholder={`SKU-${v.size}`} className="w-full min-w-[80px] bg-brand/5 border border-transparent focus:border-[#C5A059]/40 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                          </td>
                          <td className="px-5 py-3 text-center">
                            <button 
                              type="button" 
                              onClick={() => setVariations(prev => prev.filter((_, i) => i !== idx))}
                              className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-brand/10 rounded-2xl">
                  <p className="text-[10px] font-black text-brand/30 uppercase tracking-[0.2em]">Select sizes and/or colors above to generate the variation matrix</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button disabled={isSubmitting}
              className="w-full bg-brand text-brand-accent py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-brand-hover hover:shadow-[0_20px_40px_rgba(27,48,34,0.2)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-4 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative flex items-center space-x-3">
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : editingId ? <Check size={20} /> : <Plus size={20} />}
                <span>{isSubmitting ? "Processing..." : editingId ? "Update Product" : "Add to Store"}</span>
              </div>
            </button>
          </form>
        </div>

        {/* ─── RIGHT: INVENTORY (Context Sidebar) ───────────────────── */}
        <div className="flex-[1] min-w-[320px] h-full overflow-y-auto bg-brand/5 custom-scrollbar p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="text-[#C5A059]" size={22} />
                <h2 className="text-2xl font-playfair font-bold text-brand">Inventory</h2>
              </div>
              <span className="text-[10px] font-black text-brand/30 uppercase tracking-widest bg-brand/5 px-3 py-1.5 rounded-full">{products.length} total</span>
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand/20 group-focus-within:text-[#C5A059] transition-colors" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search inventory..."
                className="w-full bg-white border border-brand/5 focus:border-[#C5A059]/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-brand outline-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2 pr-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-brand/20">
                  <Loader2 size={36} className="animate-spin mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Loading…</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-brand/10 rounded-3xl">
                  <Package size={40} className="text-brand/10 mx-auto mb-3" />
                  <p className="text-[10px] font-black text-brand/30 uppercase tracking-widest">No products found</p>
                  <p className="text-[10px] text-brand/20 mt-2">Try a different search term</p>
                </div>
              ) : filteredProducts.map(product => {
                const firstImg = getFirstImage(product.images);
                const off = product.basePrice && product.salePrice ? Math.round((1 - product.salePrice / product.basePrice) * 100) : 0;
                const isCurrentlyEditing = editingId === product.id;
                
                return (
                  <div key={product.id} className={`bg-white rounded-2xl p-3 border transition-all duration-300 group ${isCurrentlyEditing ? "border-brand-accent shadow-lg" : "border-brand/5 hover:border-brand-accent/30 shadow-sm"}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-brand/5 border border-brand/5 flex-shrink-0 relative">
                        <img src={firstImg} alt={product.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.src = "/images/placeholder.png")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-[11px] font-bold text-brand truncate">{product.name}</h3>
                          {product.isFeatured && <Sparkles size={8} className="text-brand-accent" />}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-black text-brand">₹{product.salePrice?.toLocaleString()}</span>
                          {off > 0 && <span className="text-[8px] text-green-600 font-bold">{off}% OFF</span>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               openStockModal(product);
                             }}
                             title="Click to manage stock"
                             className={`text-[8px] font-black px-2 py-0.5 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer ${(product.totalStock || 0) > 10 ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
                           >
                            {product.totalStock || 0} STOCK
                          </button>
                          <div className="flex space-x-1">
                            <button onClick={() => handleEdit(product.id)} className={`p-1.5 rounded-lg transition-all ${isCurrentlyEditing ? "bg-brand text-white" : "bg-brand/5 text-brand hover:bg-brand hover:text-white"}`}><Edit3 size={10} /></button>
                            <button onClick={() => handleDelete(product.id)} className="p-1.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"><Trash2 size={10} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
