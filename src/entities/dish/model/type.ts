export type DishPriority = "high" | "medium" | "low";

export type DishIngredient = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  stock: number;
  costPerUnit: number;
  expiresOn: string;
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stopped: boolean;
  archived?: boolean;
  stopReason?: string;
  ingredients: DishIngredient[];
  recommendation?: { reason: string; priority: DishPriority };
  sales: { date: string; quantity: number }[];
};

export type DishDraft = Omit<Dish, "id" | "sales" | "recommendation">;
