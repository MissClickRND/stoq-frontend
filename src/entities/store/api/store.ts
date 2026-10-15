export function removeProduct(_id: string): void {
  //! Подключить списание складской позиции по ID; обновить остатки после ответа сервера.
}

import { baseApi } from "@/shared/api";
import { inventorySocketCache } from "./socket-cache";
import { matchesStoreProduct } from "../lib/search";
import type {
  IExpiringStoreProduct,
  IInventoryStoreRequest, IInventoryStoreReport,
  IStoreProduct,
} from "../model/type";

export const storeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStore: build.query<IStoreProduct[], { search: string }>({
      async queryFn({ search }, api) {
        try { return { data: (await inventorySocketCache.readStock(api.signal)).filter(batch => matchesStoreProduct(batch, search)) }; }
        catch (error) { return { error: { status: "CUSTOM_ERROR", error: error instanceof Error ? error.message : "Склад недоступен" } }; }
      },
      providesTags: [{ type: "Store", id: "LIST" }],
    }),

    getStoreProductById: build.query<IStoreProduct[], { id: number }>({
      async queryFn({ id }, api) {
        try { return { data: (await inventorySocketCache.readStock(api.signal)).filter(batch => batch.productId === id) }; }
        catch (error) { return { error: { status: "CUSTOM_ERROR", error: error instanceof Error ? error.message : "Склад недоступен" } }; }
      },
      providesTags: (_result, _error, arg) => [{ type: "Store", id: arg.id }],
    }),

    getExpiringStore: build.query<
      IExpiringStoreProduct[],
      { daysThreshold: number }
    >({
      async queryFn({ daysThreshold }, api) {
        try { return { data: await inventorySocketCache.readExpiring(daysThreshold, api.signal) }; }
        catch (error) { return { error: { status: "CUSTOM_ERROR", error: error instanceof Error ? error.message : "Склад недоступен" } }; }
      },
      providesTags: [{ type: "Store", id: "LIST" }],
    }),

    previewInventory: build.query<IInventoryStoreReport["statistics"], IInventoryStoreRequest>({
      query: body => ({ url: "/inventory/preview", method: "POST", body }),
      providesTags: ["Store"],
    }),
    inventoryStoreReport: build.mutation<IInventoryStoreReport, IInventoryStoreRequest & { includeReport: true }>({
      query: body => ({ url: "/inventory", method: "PUT", body }),
      invalidatesTags: ["Store", "Dish", "Statistic"],
    }),
    inventoryStore: build.mutation<IStoreProduct[], IInventoryStoreRequest>({
      query: (data) => ({
        url: "/inventory",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Store", "Dish", "Statistic"],
    }),

    writeOffStoreBatch: build.mutation<
      {
        batchId: number;
        availableQuantity: number;
        writtenOffQuantity: number;
      },
      { batchId: number }
    >({
      query: ({ batchId }) => ({
        url: `/inventory/${batchId}/write-off`,
        method: "POST",
      }),
      invalidatesTags: ["Store", "Dish", "Supply", "Statistic"],
    }),

    // deleteDish: build.mutation<void, { id: number }>({
    //   query: ({ id }) => ({
    //     url: `/dishes/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: (_result, _error, arg) => [
    //     { type: "Dish", id: "LIST" },
    //     { type: "Dish", id: arg.id },
    //   ],
    // }),
  }),
});

export const {
  useGetStoreProductByIdQuery,
  useGetStoreQuery,
  useGetExpiringStoreQuery,
  useInventoryStoreMutation, useInventoryStoreReportMutation, usePreviewInventoryQuery,
  useWriteOffStoreBatchMutation,
} = storeApi;
