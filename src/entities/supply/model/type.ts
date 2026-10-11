import type { Product } from "../../product/@x/supply.ts";
export type { Product } from "../../product/@x/supply.ts";
export type SupplyItem = {
  id: string;
  product: Product;
  quantity: number;
  unit: string;
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
  unit: string;
  expiresAt: string | null;
  price: number | string;
  pricingMode: "unit" | "total";
};
