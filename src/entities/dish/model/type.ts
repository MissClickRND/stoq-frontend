import type { IProduct } from "../../product/@x/dish";

export type DishPriority = "high" | "medium" | "low";

export type IDishIngredient = {
  id: number;
  productId: number;
  dishId: number;
  quantity: number;
  product: IProduct;
};

export type IDish = {
  id: number;
  name: string;
  description: string;
  salePrice: number;
  imageUrl?: string;

  recipeItems: IDishIngredient[];
};

export type DishDraft = Omit<IDish, "id" | "sales" | "recommendation">;

export type ICreateDishRequest = Pick<
  IDish,
  "name" | "description" | "imageUrl" | "salePrice"
> & {
  recipeItems: Pick<IDishIngredient, "productId" | "quantity">;
};
