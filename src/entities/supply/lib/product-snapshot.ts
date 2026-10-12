import type { SupplyItem } from "../model/type.ts";

export const supplyProductName = (product: SupplyItem["product"]) =>
  "name" in product ? product.name : product.title;

export const supplyProductReference = (product: SupplyItem["product"]) =>
  "name" in product ? String(product.id) : product.article;
