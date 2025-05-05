import { create } from "zustand";

export const useCatalogStore = create((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  maxCalories: "",
  setMaxCalories: (calories) => set({ maxCalories: calories }),

  maxPrepTime: "",
  setMaxPrepTime: (time) => set({ maxPrepTime: time }),

  excludedIngredients: "",
  setExcludedIngredients: (ingredients) =>
    set({ excludedIngredients: ingredients }),
}));
