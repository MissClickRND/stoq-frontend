import { useAppDispatch, useAppSelector } from "@/shared/lib/store";
import { useEffect } from "react";
import dayjs from "dayjs";
import {
  storeApi,
  useGetStoreQuery,
  useInventoryStoreMutation,
} from "@/entities/store";
import {
  inventoryEntryError,
  toInventoryStoreRequest,
  type InventoryEntry,
} from "@/entities/inventory";
import { saveInventoryDraft } from "./saveInventory";
import { inventoryDraftActions } from "./inventorySlice";

export function useInventory() {
  const draft = useAppSelector((state) => state.inventoryDraft);
  const dispatch = useAppDispatch();
  const { currentData, isSuccess, isFetching, isError, refetch } = useGetStoreQuery(
    { search: "" },
    { refetchOnMountOrArgChange: true },
  );
  const [inventoryStore, { isLoading: isSaving }] = useInventoryStoreMutation();

  useEffect(() => {
    if (!draft.initialized && isSuccess && !isFetching && currentData)
      dispatch(
        inventoryDraftActions.initialize(currentData),
      );
  }, [draft.initialized, isSuccess, isFetching, currentData, dispatch]);

  return {
    ...draft,
    isLoading: !draft.initialized && isFetching,
    isError,
    refetch,
    isSaving,
    setDate: (date: string | null) =>
      dispatch(inventoryDraftActions.setDate(date)),
    updateEntry: (
      id: number,
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
    save: async (name: string) => {
      const report = await saveInventoryDraft(draft, name, (request) =>
        inventoryStore(request).unwrap(),
      );
      // The endpoint invalidates the list; refresh cached detail records as well.
      dispatch(
        storeApi.util.invalidateTags(
          toInventoryStoreRequest(draft.entries).items.map(({ batchId }) => ({
            type: "Store",
            id: batchId,
          })),
        ),
      );
      dispatch(inventoryDraftActions.complete(report));
    },
  };
}

export function useInventoryReport() {
  return { report: useAppSelector((state) => state.inventoryDraft.report) };
}

export function useStartInventory() {
  const dispatch = useAppDispatch();
  return () =>
    dispatch(inventoryDraftActions.reset(dayjs().format("YYYY-MM-DD")));
}
