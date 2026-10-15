import type { IInventoryStoreRequest } from "../../store/@x/inventory.ts";
import type { InventoryEntry, InventoryCounts } from "../model/type.ts";

export function inventoryEntryError(entry: InventoryEntry): string | null {
  if (entry.remove) return null;
  if (typeof entry.actual === "string" && !entry.actual.trim())
    return "Укажите фактический остаток";
  if (!Number.isFinite(Number(entry.actual)) || Number(entry.actual) < 0)
    return "Укажите число от 0";
  return null;
}

export function inventoryCounts(entries: InventoryEntry[]): InventoryCounts {
  const deleted = entries.filter((entry) => entry.remove).length;
  const updated = entries.filter(
    (entry) =>
      !entry.remove && Number(entry.actual) !== entry.product.Quantity,
  ).length;
  return {
    checked: entries.length,
    updated,
    deleted,
    unchanged: entries.length - deleted - updated,
  };
}

export function inventoryChange(entry: InventoryEntry) {
  return entry.remove
    ? "deleted"
    : Number(entry.actual) !== entry.product.Quantity
      ? "updated"
      : "unchanged";
}

export function toInventoryStoreRequest(
  entries: InventoryEntry[],
): IInventoryStoreRequest {
  return {
    items: entries.flatMap((entry) => {
      const error = inventoryEntryError(entry);
      if (error) throw new Error(error);
      if (!entry.remove && inventoryChange(entry) === "unchanged") return [];
      return [{
        batchId: entry.product.id,
        quantity: entry.remove ? 0 : Number(entry.actual),
      }];
    }),
  };
}

export function toInventoryPreviewRequest(entries: InventoryEntry[]): IInventoryStoreRequest {
  return { items: entries.map(entry => {
    const error = inventoryEntryError(entry);
    if (error) throw new Error(error);
    return { batchId: entry.product.id, quantity: entry.remove ? 0 : Number(entry.actual), remove: entry.remove };
  }) };
}
