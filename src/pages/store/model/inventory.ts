import type { StoreProduct } from "./type";
import type { InventoryEntry, InventoryCounts } from "./inventory-type";

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

export function applyInventoryToProducts(
  products: StoreProduct[],
  entries: InventoryEntry[],
): StoreProduct[] {
  if (entries.some((entry) => inventoryEntryError(entry)))
    throw new Error("Заполните фактические остатки");
  const byId = new Map(entries.map((entry) => [entry.product.id, entry]));
  return products.flatMap((product) => {
    const entry = byId.get(product.id);
    if (!entry) return [product];
    if (entry.remove) return [];
    if (Number(entry.actual) === Number(product.remains)) return [product];
    const quantity = Number(entry.actual);
    return [
      {
        ...product,
        remains: String(quantity),
        totalPrice: (
          Math.round(quantity * Number(product.price) * 100) / 100
        ).toFixed(2),
      },
    ];
  });
}
