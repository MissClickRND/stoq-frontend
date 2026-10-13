import type { IProduct as Product } from '../../product/@x/store';

export type IStoreStatus = "ACTIVE" | "DEPLETED" | "EXPIRED";

export type IStoreProduct = {
  id: number;
  supplyId: number;
  productId: number;
  Quantity: number;
  price: number | null;
  totalPrice: number | null;
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
