import dayjs from "dayjs";
import {
  inventoryCounts,
  toInventoryStoreRequest,
  type InventoryEntry,
  type InventoryReport,
} from "@/entities/inventory";
import type { IInventoryStoreRequest, IStoreProduct } from "@/entities/store";

type InventoryDraft = { entries: InventoryEntry[]; date: string | null };

export async function saveInventoryDraft(
  draft: InventoryDraft,
  name: string,
  persist: (request: IInventoryStoreRequest) => Promise<IStoreProduct[]>,
): Promise<InventoryReport> {
  if (!draft.date) throw new Error("Выберите дату инвентаризации");
  if (!draft.entries.length) throw new Error("Нет позиций для инвентаризации");
  const request = toInventoryStoreRequest(draft.entries);
  const saved = await persist(request);
  const quantities = new Map(saved.map((batch) => [batch.id, batch.Quantity]));
  const entries = draft.entries.map((entry) => ({
    ...entry,
    actual: entry.remove ? 0 : quantities.get(entry.product.id) ?? Number(entry.actual),
  }));
  return {
    entries,
    date: draft.date,
    // The API returns batches; report metadata belongs to this browser session.
    completedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    completedBy: name,
    counts: inventoryCounts(entries),
  };
}
