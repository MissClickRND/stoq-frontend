import type { ScannedSupplyItem, SupplyItemDraft } from "../model/type.ts";

export function toUpdSupplyDrafts(items: ScannedSupplyItem[]): SupplyItemDraft[] {
  return items.map((item) => ({
    id: crypto.randomUUID(),
    product: { id: item.productId, name: item.name, unitId: item.unit.id, unit: item.unit },
    quantity: item.quantity ?? "",
    unitId: item.unit.id,
    expiresAt: null,
    price: item.totalPrice ?? item.price ?? "",
    pricingMode: item.totalPrice !== null ? "total" : "unit",
  }));
}
