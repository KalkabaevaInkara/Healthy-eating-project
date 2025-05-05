import { create } from "zustand";
import axios from "axios";

export const useMealPlanStore = create((set) => ({
  plan: {},
  recipes: [],

  setRecipe(day, meal, recipeId) {
    set((state) => ({
      plan: {
        ...state.plan,
        [day]: {
          ...(state.plan[day] || {}),
          [meal]: recipeId,
        },
      },
    }));
  },

  removeRecipe(day, meal) {
    set((state) => {
      const updatedDay = { ...state.plan[day] };
      delete updatedDay[meal];
      return {
        plan: {
          ...state.plan,
          [day]: updatedDay,
        },
      };
    });
  },

  fetchRecipes: async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/recipe");
      const enriched = response.data.map((r) => ({
        ...r,
        protein: r.protein ?? 20,
        fat: r.fat ?? 10,
        carbs: r.carbs ?? 15,
      }));
      console.log("Загруженные рецепты из API:", enriched);
      set({ recipes: enriched });
    } catch (error) {
      console.error("Ошибка при загрузке рецептов:", error);
    }
  },

  getFilteredRecipes: () => {
    const { recipes } = useMealPlanStore.getState();
    return recipes;
  },
}));
