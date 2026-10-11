import { mockStock } from "../../stock/@x/inventory.ts";
import type { InventoryReport } from "./type.ts";
import { inventoryCounts } from "../lib/inventory.ts";
const entries = mockStock.map((product) => ({
  product,
  actual: Number(product.remains),
  remove: false,
}));
export const mockInventoryReport: InventoryReport = {
  date: "2026-10-11",
  completedAt: "2026-10-11 15:42:00",
  completedBy: "Алиса Зарева",
  entries,
  counts: inventoryCounts(entries),
};
