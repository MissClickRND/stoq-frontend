import { createContext, useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import dayjs from "dayjs";
import { useStoreProducts } from "./StoreProvider";
import { inventoryCounts, inventoryEntryError } from "./inventory";
import type { InventoryEntry, InventoryReport } from "./inventory-type";

type InventoryContextValue = {
  entries: InventoryEntry[];
  date: string | null;
  setDate: (date: string | null) => void;
  updateEntry: (
    id: string,
    patch: Partial<Pick<InventoryEntry, "actual" | "remove">>,
  ) => void;
  ready: boolean;
  prepare: () => boolean;
  save: (name: string) => void;
  report: InventoryReport | null;
};
const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryRoutesLayout() {
  const { products, applyInventory } = useStoreProducts();
  const [entries, setEntries] = useState<InventoryEntry[]>(() =>
    products.map((product) => ({
      product: { ...product },
      actual: Number(product.remains),
      remove: false,
    })),
  );
  const [date, setDate] = useState<string | null>(() =>
    dayjs().format("YYYY-MM-DD"),
  );
  const [ready, setReady] = useState(false);
  const [report, setReport] = useState<InventoryReport | null>(null);
  const updateEntry: InventoryContextValue["updateEntry"] = (id, patch) => {
    setReady(false);
    setEntries((current) =>
      current.map((entry) =>
        entry.product.id === id ? { ...entry, ...patch } : entry,
      ),
    );
  };
  const prepare = () => {
    const valid = Boolean(
      date &&
        entries.length &&
        entries.every((entry) => !inventoryEntryError(entry)),
    );
    setReady(valid);
    return valid;
  };
  const save = (name: string) => {
    if (
      report ||
      !ready ||
      !date ||
      entries.some((entry) => inventoryEntryError(entry))
    )
      return;
    const snapshot = entries.map((entry) => ({
      ...entry,
      product: { ...entry.product },
      actual: entry.remove ? 0 : Number(entry.actual),
    }));
    applyInventory(snapshot);
    setReport({
      date,
      completedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      completedBy: name,
      entries: snapshot,
      counts: inventoryCounts(snapshot),
    });
  };
  return (
    <InventoryContext.Provider
      value={{
        entries,
        date,
        setDate: (value) => {
          setDate(value);
          setReady(false);
        },
        updateEntry,
        ready,
        prepare,
        save,
        report,
      }}
    >
      <Outlet />
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory requires InventoryRoutesLayout");
  return context;
}
