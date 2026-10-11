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
      !entry.remove && Number(entry.actual) !== Number(entry.product.remains),
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
    : Number(entry.actual) !== Number(entry.product.remains)
      ? "updated"
      : "unchanged";
}
