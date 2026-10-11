import type { DishIngredient } from "@/entities/dish";
export const dishFormDefaults = {
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  stopped: false,
  stopReason: "",
  ingredients: [] as DishIngredient[],
};
