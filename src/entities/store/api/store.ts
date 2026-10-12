export function removeProduct(_id: string): void {
  //! Подключить списание складской позиции по ID; обновить остатки после ответа сервера.
}

import { baseApi } from "@/shared/api";
import { IInventoryStoreRequest, IStoreProduct } from "../model/type";

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

    getStoreProductById: build.query<IStoreProduct, { id: number }>({
      query: ({ id }) => ({
        url: `/inventory/${id}`,
      }),
      providesTags: (_result, _error, arg) => [{ type: "Store", id: arg.id }],
    }),

    inventoryStore: build.mutation<IStoreProduct[], IInventoryStoreRequest>({
      query: (data) => ({
        url: "/inventory",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: "Store", id: "LIST" }],
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
  useInventoryStoreMutation,
} = storeApi;
