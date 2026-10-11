import type { StoreProduct } from "../../stock/@x/inventory.ts";

export type InventoryEntry = {
  product: StoreProduct;
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
