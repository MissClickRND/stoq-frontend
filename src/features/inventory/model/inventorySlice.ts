import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import type { StoreProduct } from "@/entities/stock";
import type { InventoryEntry } from "@/entities/inventory";
const initialState = {
  entries: [] as InventoryEntry[],
  date: dayjs().format("YYYY-MM-DD") as string | null,
  ready: false,
  initialized: false,
};
const slice = createSlice({
  name: "inventoryDraft",
  initialState,
  reducers: {
    initialize(state, action: PayloadAction<StoreProduct[]>) {
      if (state.initialized) return;
      state.entries = action.payload.map((product) => ({
        product: { ...product },
        actual: Number(product.remains),
        remove: false,
      }));
      state.initialized = true;
    },
    reset(state, action: PayloadAction<string>) {
      state.entries = [];
      state.date = action.payload;
      state.ready = false;
      state.initialized = false;
    },
    setDate(state, action: PayloadAction<string | null>) {
      state.date = action.payload;
      state.ready = false;
    },
    updateEntry(
      state,
      action: PayloadAction<{
        id: string;
        patch: Partial<Pick<InventoryEntry, "actual" | "remove">>;
      }>,
    ) {
      const entry = state.entries.find(
        (entry) => entry.product.id === action.payload.id,
      );
      if (entry) Object.assign(entry, action.payload.patch);
      state.ready = false;
    },
    setReady(state, action: PayloadAction<boolean>) {
      state.ready = action.payload;
    },
  },
});
export const inventoryDraftReducer = slice.reducer;
export const inventoryDraftActions = slice.actions;
