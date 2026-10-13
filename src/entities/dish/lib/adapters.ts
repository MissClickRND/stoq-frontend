import type { IProduct } from "../../product/@x/dish";
import type { IDish, ICreateDishRequest } from "../model/type.ts";
import type { Dish, DishFormValues, DishIngredient } from "../model/view.ts";

type DishResponse = Pick<IDish, "id" | "name"> & Partial<IDish> & {
  imageURL?: string;
  isDeleted?: boolean;
};

export function toDishIngredient(
  product: Pick<IProduct, "id"> & Partial<IProduct>,
  quantity = 1,
): DishIngredient {
  return {
    id: String(product.id),
    name: product.name ?? `Продукт #${product.id}`,
    unit: product.unit?.shortName ?? "шт.",
    quantity,
    stock: 0,
    costPerUnit: null,
    expiresOn: "",
  };
}

export function toDish(source: DishResponse): Dish {
  return {
    id: String(source.id),
    name: source.name,
    description: source.description ?? "",
    category: source.category ?? "",
    price: source.salePrice ?? 0,
    priceKnown: typeof source.salePrice === 'number' && Number.isFinite(source.salePrice) && source.salePrice >= 0,
    availablePortions: typeof source.availablePortions === 'number' && Number.isFinite(source.availablePortions)
      ? Math.max(0, Math.floor(source.availablePortions)) : undefined,
    imageUrl: source.imageURL ?? source.imageUrl ?? "",
    ingredients: source.recipeItems?.map((item) =>
      ({ ...toDishIngredient({ ...item.product, id: item.productId }, item.quantity),
        stock: item.stock ?? 0, costPerUnit: item.price ?? null,
        expiresOn: item.expiresAt?.slice(0, 10) ?? "" }),
    ) ?? [],
    stopped: false,
    archived: source.isDeleted ?? false,
    sales: [],
  };
}

export function toCreateDishRequest(draft: DishFormValues): ICreateDishRequest {
  const payload = {
    name: draft.name,
    description: draft.description,
    ...(draft.category?.trim() ? { category: draft.category.trim() } : {}),
    salePrice: draft.price,
    imageURL: draft.imageUrl,
    recipeItems: draft.ingredients.map((ingredient) => {
      const productId = Number(ingredient.id);
      if (!Number.isSafeInteger(productId) || productId <= 0) {
        throw new Error("Выберите продукт из каталога сервера");
      }
      return { productId, quantity: ingredient.quantity };
    }),
  };
  return payload;
}
