import type { Product } from "../../product/@x/supply.ts";
export type { Product } from "../../product/@x/supply.ts";

export type ISupplyStatus = "RECEIVED" | "CANCELLED" | "IN_TRANSIT";

export type ISupplyItem = {
  id: number;
  product: Product;
  expiresAt: string;
  quantity: number;
  price: number | null;
  totalPrice: number | null;
};

export type ISupply = {
  id: number;
  supplyNumber: string;
  supplier: string | null;
  totalPrice: number | null;
  receivedAt: string;
  acceptedBy?: string;
  items: ISupplyItem[];
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

export type ICreateSupplyRequest = Pick<
  ISupply,
  "supplyNumber" | "receivedAt"
> & {
  supplier: string;
  items: { productId: number; quantity: number; totalPrice: number; expiresAt: Date }[];
};
