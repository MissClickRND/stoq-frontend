import type { IProduct } from "../../product/@x/dish";

export type DishPriority = "high" | "medium" | "low";
export type DishStopListStatus =
  "INSUFFICIENT_STOCK" | "ACTIVE" | "EXPIRED_INGREDIENT";

export type IDishIngredient = {
  id: number;
  productId: number;
  dishId: number;
  quantity: number;
  price: number | null;
  stock: number;
  portions: number;
  expiresAt: string | null;
  product: IProduct;
};

export type IDish = {
  id: number;
  name: string;
  category: string | null;
  description: string;
  salePrice: number | null;
  availablePortions: number;
  costPrice: number | null;
  imageUrl?: string;
  imageURL?: string | null;

  recipeItems: IDishIngredient[];
};

export type IStopListDish = {
  dishId: number;
  dishName: string;
  salePrice: number | null;
  status: "STOP_LIST";
  maxPortions: number;
  priority: number;
  reasons: { status: DishStopListStatus; name: string }[];
};

export type IRecommendedDishes = {
  dishId: number;
  dishName: string;
  salePrice: number;
  costPrice: number | null;
  profit: number | null;
  maxPortions: number;
  expiringProducts: string[];
  recommendationScore: number;
};

export type DishDraft = Omit<IDish, "id" | "sales" | "recommendation">;

export type ICreateDishRequest = Pick<
  IDish,
  "name" | "description" | "salePrice"
> & {
  category?: string;
  imageURL?: string;
  recipeItems: Pick<IDishIngredient, "productId" | "quantity">[];
};

// Модели формы и карточки блюда; таблицы используют контракты API выше.
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
  priceKnown?: boolean;
  availablePortions?: number;
  imageUrl?: string;
  stopped: boolean;
  archived?: boolean;
  stopReason?: string;
  ingredients: DishIngredient[];
  recommendation?: { reason: string; priority: DishPriority };
  sales: { date: string; quantity: number }[];
};

export type DishFormValues = Omit<Dish, "id" | "sales" | "recommendation">;
