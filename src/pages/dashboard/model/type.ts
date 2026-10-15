import type { IStoreProduct } from "@/entities/store";

export type LowStockProduct = {
  product: IStoreProduct["product"];
  imageUrl?: string;
  quantity: number;
};
