import type { IStoreProduct } from "../../store/@x/inventory.ts";

export type InventoryEntry = {
  product: IStoreProduct;
  actual: number | string;
  remove: boolean;
};
export type InventoryCounts = {
  checked: number;
  updated: number;
  deleted: number;
  unchanged: number;
};
export type InventoryReport = {
  date: string;
  completedAt: string;
  completedBy: string;
  entries: InventoryEntry[];
  counts: InventoryCounts;
};
