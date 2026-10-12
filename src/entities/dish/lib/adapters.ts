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
    //! Заменить фиксированные остаток, стоимость и срок данными склада.
    stock: 1000,
    costPerUnit: 0,
    expiresOn: "2099-12-31",
  };
}

export function toDish(source: DishResponse): Dish {
  return {
    id: String(source.id),
    name: source.name,
    description: source.description ?? "",
    price: source.salePrice ?? 0,
    imageUrl: source.imageURL ?? source.imageUrl ?? "",
    ingredients: source.recipeItems?.map((item) =>
      toDishIngredient({ ...item.product, id: item.productId }, item.quantity),
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
  // Swagger принимает imageURL и массив recipeItems. Локальный контракт
  // остаётся без изменений; расхождение изолировано на границе адаптера.
  return payload as unknown as ICreateDishRequest;
}
