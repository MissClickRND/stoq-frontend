export function removeProduct(_id: string): void {
  //! Подключить списание складской позиции по ID; обновить остатки после ответа сервера.
}

import { baseApi } from "@/shared/api";
import type {
  IExpiringStoreProduct,
  IInventoryStoreRequest,
  IStoreProduct,
} from "../model/type";

export const storeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStore: build.query<IStoreProduct[], { search: string }>({
      query: ({ search }) => ({
        url: "/inventory",
        params: {
          search,
        },
      }),
      providesTags: [{ type: "Store", id: "LIST" }],
    }),

    getStoreProductById: build.query<IStoreProduct[], { id: number }>({
      query: ({ id }) => ({
        url: `/inventory/${id}`,
      }),
      providesTags: (_result, _error, arg) => [{ type: "Store", id: arg.id }],
    }),

    getExpiringStore: build.query<
      IExpiringStoreProduct[],
      { daysThreshold: number }
    >({
      query: ({ daysThreshold }) => ({
        url: "/inventory/expiring",
        params: { daysThreshold },
      }),
      providesTags: [{ type: "Store", id: "LIST" }],
    }),

    inventoryStore: build.mutation<IStoreProduct[], IInventoryStoreRequest>({
      query: (data) => ({
        url: "/inventory",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Store", "Dish"],
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
      invalidatesTags: ["Store", "Dish", "Supply"],
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
  useInventoryStoreMutation,
  useWriteOffStoreBatchMutation,
} = storeApi;
