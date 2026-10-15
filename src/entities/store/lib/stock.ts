import type { IStoreProduct } from "../model/type.ts";

export function getStoreQuantity(batch: Pick<IStoreProduct, "Quantity" | "availableQuantity">): number {
  return Number(batch.availableQuantity ?? batch.Quantity);
}

export function getProductBatches(batches: IStoreProduct[], selected: IStoreProduct): IStoreProduct[] {
  return [selected, ...batches.filter((batch) => batch.productId === selected.productId && batch.id !== selected.id)];
}

export function getTotalStoreQuantity(batches: IStoreProduct[]): number {
  return batches.reduce((total, batch) => total + getStoreQuantity(batch), 0);
}
