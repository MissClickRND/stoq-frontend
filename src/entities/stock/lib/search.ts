import type { StoreProduct } from "../model/type.ts";

export function matchesStoreProduct(product: StoreProduct, search: string) {
  return `${product.title} ${product.article} ${product.supplyId}`
    .toLocaleLowerCase("ru-RU")
    .includes(search.trim().toLocaleLowerCase("ru-RU"));
}
