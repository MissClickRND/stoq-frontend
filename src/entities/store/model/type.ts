import { Product } from "@/entities/supply";

export type IStoreStatus = "ACTIVE" | "DEPLETED" | "EXPIRED";

export type IStoreProduct = {
  id: number;
  supplyId: number;
  productId: number;
  Quantity: number;
  expiresAt: string;
  status: IStoreStatus;
  product: Pick<Product, "id" | "name" | "unit">;
};

export type IInventoryStoreRequest = {
  items: {
    batchId: number;
    quantity: number;
  }[];
};
