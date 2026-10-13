import type { IProduct } from "../../product/@x/dish";

export type DishPriority = "high" | "medium" | "low";

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

  recipeItems: IDishIngredient[];
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
