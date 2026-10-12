import type { ISupplyItem } from "../model/type.ts";
import { normalizeArticle } from "../../../shared/lib/format.ts";

export const supplyProductName = (product: ISupplyItem["product"]) =>
  product?.name ?? "Продукт";

export const supplyProductReference = (product: ISupplyItem["product"]) =>
  normalizeArticle(product?.id);
