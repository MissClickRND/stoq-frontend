import { toInventoryPreviewRequest, type InventoryEntry, type InventoryReport } from "@/entities/inventory";
import type { IInventoryStoreRequest, IInventoryStoreReport } from "@/entities/store";
type InventoryDraft = { entries: InventoryEntry[]; date: string | null };
export async function saveInventoryDraft(draft: InventoryDraft, name: string, persist: (request: IInventoryStoreRequest & { includeReport: true }) => Promise<IInventoryStoreReport>): Promise<InventoryReport> {
  if (!draft.date) throw new Error("Выберите дату инвентаризации");
  if (!draft.entries.length) throw new Error("Нет позиций для инвентаризации");
  const saved = await persist({ ...toInventoryPreviewRequest(draft.entries), includeReport: true });
  const quantities = new Map(saved.batches.map(batch => [batch.id, batch.Quantity]));
  const entries = draft.entries.map(entry => ({ ...entry, actual: entry.remove ? 0 : quantities.get(entry.product.id) ?? Number(entry.actual) }));
  return { entries, date: draft.date, completedAt: saved.completedAt, completedBy: name, counts: saved.statistics };
}
