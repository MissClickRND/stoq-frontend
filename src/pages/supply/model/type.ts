export type SupplyProduct = {
  id: string;
  title: string;
  article: string;
  unit: string;
  price: number;
};

export type SupplyItem = {
  id: string;
  product: SupplyProduct;
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
  product: SupplyProduct;
  quantity: number | string;
  unit: string;
  expiresAt: string | null;
  price: number | string;
  pricingMode: "unit" | "total";
};
