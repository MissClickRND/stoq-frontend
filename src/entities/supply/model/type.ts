import type { Product } from "../../product/@x/supply.ts";
import type { mockProducts } from "./mock.ts";
export type { Product } from "../../product/@x/supply.ts";
export type SupplyItem = {
  id: string;
  // Исторические поставки пока используют снимки старого каталога.
  product: Product | (typeof mockProducts)[number];
  quantity: number;
  unit: string;
  unitId?: number;
  expiresAt: string;
  unitPrice: number;
  total: number;
};

export type Supply = {
  id: string;
  supplier: string;
  receivedAt: string;
  acceptedBy: string;
  items: SupplyItem[];
};

export type SupplyItemDraft = {
  id: string;
  product: Product;
  quantity: number | string;
  unitId: number | null;
  expiresAt: string | null;
  price: number | string;
  pricingMode: "unit" | "total";
};
