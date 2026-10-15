import type { IProduct as Product } from '../../product/@x/store';

export type IStoreStatus = "ACTIVE" | "DEPLETED" | "RUNNINGOUT";

export type IStoreProduct = {
  id: number;
  supplyId: number;
  productId: number;
  Quantity: number;
  productQuantity?: number;
  availableQuantity?: number | string;
  price: number | null;
  totalPrice: number | null;
  expiresAt: string;
  status: IStoreStatus;
  product: Pick<Product, "id" | "name" | "unit">;
};

export type IExpiringStoreProduct = {
  batchId: number;
  productId: number;
  product: IStoreProduct["product"] | null;
  expiresAt: string;
  daysRemaining: number;
  availableQuantity: string | number;
  price: string | null;
};

export type IInventoryStoreRequest = {
  items: {
    batchId: number;
    quantity: number;
    remove?: boolean;
  }[];
};

export type IInventoryStoreReport = { batches: IStoreProduct[]; statistics: { checked: number; updated: number; deleted: number; unchanged: number }; completedAt: string };
