import type { IStoreProduct } from "../model/type.ts";

export function matchesStoreProduct(product: IStoreProduct, search: string) {
  const value = [product.product?.name ?? "", product.productId, product.supplyId].join(" ");
  return value.toLocaleLowerCase("ru-RU")
    .includes(search.trim().toLocaleLowerCase("ru-RU"));
}
