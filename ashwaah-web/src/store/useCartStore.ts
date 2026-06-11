import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // unique hash for the item configuration
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  color?: string;
  customizations: any;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, qty: number) => void;
  updateItemVariant: (id: string, newSize: string, newPrice: number) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === newItem.id);
        
        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...newItem, quantity: 1 }] });
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      
      updateQuantity: (id, delta) => {
        const currentItems = get().items;
        set({
          items: currentItems.map((item) => {
            if (item.id === id) {
              const newQuantity = Math.max(0, item.quantity + delta);
              return { ...item, quantity: newQuantity };
            }
            return item;
          }).filter(item => item.quantity > 0),
        });
      },
      
      setItems: (items) => set({ items }),
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      setQuantity: (id, qty) => {
        const currentItems = get().items;
        set({
          items: currentItems.map((item) => {
            if (item.id === id) {
              return { ...item, quantity: Math.max(1, qty) };
            }
            return item;
          }),
        });
      },

      updateItemVariant: (id, newSize, newPrice) => {
        const currentItems = get().items;
        const itemIndex = currentItems.findIndex((item) => item.id === id);
        if (itemIndex === -1) return;

        const item = currentItems[itemIndex];
        const customHash = item.id.includes("_custom_")
          ? item.id.substring(item.id.indexOf("_custom_"))
          : "";
        const newId = `prod_${item.productId}_${item.color || "default"}_${newSize}${customHash}`;

        // Check if another item with newId already exists in the cart (except the current item itself)
        const existingItemIndex = currentItems.findIndex((x) => x.id === newId);

        if (existingItemIndex !== -1 && existingItemIndex !== itemIndex) {
          // Merge them!
          const existingItem = currentItems[existingItemIndex];
          set({
            items: currentItems
              .map((x, idx) => {
                if (idx === existingItemIndex) {
                  return {
                    ...existingItem,
                    quantity: existingItem.quantity + item.quantity,
                  };
                }
                return x;
              })
              .filter((_, idx) => idx !== itemIndex), // Remove the old item
          });
        } else {
          // Just update the size, price and id of the current item
          set({
            items: currentItems.map((x, idx) =>
              idx === itemIndex
                ? { ...x, id: newId, size: newSize, price: newPrice }
                : x
            ),
          });
        }
      },
    }),
    {
      name: "ashwaah-cart",
    }
  )
);
