import { Product } from "@/entities/supply";

export type IStoreStatus = "ACTIVE" | "DEPLETED" | "EXPIRED";

export type IStoreProduct = {
  id: number;
  supplyId: number;
  productId: number;
  initialQuantity: number; //Сколько было в поставке
  balance: {
    availableQuantity: number; //Сколько сейчас
    reservedQuantity: number; // Сколько зарезервировано
  };
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
