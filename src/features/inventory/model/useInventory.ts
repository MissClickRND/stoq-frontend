import { useAppDispatch, useAppSelector } from "@/shared/lib/store";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useStoreProducts } from "@/entities/stock";
import {
  inventoryEntryError,
  saveInventory,
  type InventoryEntry,
} from "@/entities/inventory";
import { inventoryDraftActions } from "./inventorySlice";
export function useInventory() {
  const draft = useAppSelector((state) => state.inventoryDraft);
  const dispatch = useAppDispatch();
  const { products, isLoading } = useStoreProducts();
  useEffect(() => {
    if (!draft.initialized && !isLoading)
      dispatch(inventoryDraftActions.initialize(products));
  }, [draft.initialized, isLoading, products, dispatch]);
  return {
    ...draft,
    setDate: (date: string | null) =>
      dispatch(inventoryDraftActions.setDate(date)),
    updateEntry: (
      id: string,
      patch: Partial<Pick<InventoryEntry, "actual" | "remove">>,
    ) => dispatch(inventoryDraftActions.updateEntry({ id, patch })),
    prepare: () => {
      const valid = Boolean(
        draft.date &&
          draft.entries.length &&
          draft.entries.every((entry) => !inventoryEntryError(entry)),
      );
      dispatch(inventoryDraftActions.setReady(valid));
      return valid;
    },
    save: (name: string) => {
      if (draft.ready && draft.date)
        saveInventory(draft.entries, draft.date, name);
    },
  };
}

export function useStartInventory() {
  const dispatch = useAppDispatch();
  return () =>
    dispatch(inventoryDraftActions.reset(dayjs().format("YYYY-MM-DD")));
}
