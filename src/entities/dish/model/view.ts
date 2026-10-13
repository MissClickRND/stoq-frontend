import type { DishPriority } from "./type.ts";

// Модель отображения отделена от существующего контракта API.
export type DishIngredient = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  stock: number;
  costPerUnit: number | null;
  expiresOn: string;
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  category?: string;
  price: number;
  imageUrl?: string;
  stopped: boolean;
  archived?: boolean;
  stopReason?: string;
  ingredients: DishIngredient[];
  recommendation?: { reason: string; priority: DishPriority };
  sales: { date: string; quantity: number }[];
};

export type DishFormValues = Omit<Dish, "id" | "sales" | "recommendation">;
