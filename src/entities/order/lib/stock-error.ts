import { apiErrorMessage } from "../../../shared/lib/api-error/index.ts";
import type { Dish } from "../../dish/@x/order.ts";
import type { OrderItemDraft } from "../model/type.ts";

type MissingProduct = { productId: number; name: string };
export type OrderStockError = {
  message: string;
  products: MissingProduct[];
  dishes: Record<string, string[]>;
};

export function getOrderStockError(
  error: unknown,
  items: Pick<OrderItemDraft, "dishId">[],
  catalog: Pick<Dish, "id" | "ingredients">[],
): OrderStockError {
  const data = error && typeof error === "object" && "data" in error
    ? error.data : undefined;
  const entries = data && typeof data === "object" && "products" in data && Array.isArray(data.products)
    ? data.products : [];
  const products: MissingProduct[] = [];
  for (const entry of entries) {
    if (entry && Number.isSafeInteger(entry.productId) && entry.productId > 0 &&
      typeof entry.name === "string" && entry.name.trim() &&
      !products.some((product) => product.productId === entry.productId)) {
      products.push({ productId: entry.productId, name: entry.name.trim() });
    }
  }
  const dishes: Record<string, string[]> = {};
  for (const item of items) {
    const dish = catalog.find((dish) => dish.id === item.dishId);
    const missing = products.filter((product) =>
      dish?.ingredients.some((ingredient) => ingredient.id === String(product.productId)),
    );
    if (missing.length) dishes[item.dishId] = missing.map((product) => product.name);
  }
  return {
    products,
    dishes,
    message: products.length
      ? `Недостаточно продуктов: ${products.map((product) => product.name).join(", ")}`
      : error instanceof Error ? error.message : apiErrorMessage(error, "Не удалось создать заказ"),
  };
}
