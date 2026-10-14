import type { IProduct } from "@/entities/product";

export type LowStockProduct = {
  product: IProduct;
  imageUrl?: string;
  quantity: number;
  initialQuantity: number;
};
