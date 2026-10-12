import { baseApi } from "@/shared/api";
import type { ICreateDishRequest, IDish } from "../model/type";

export const dishApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDishes: build.query<IDish[], { search: string }>({
      query: ({ search }) => ({
        url: "/dishes",
        params: {
          search,
        },
      }),

      providesTags: [{ type: "Dish", id: "LIST" }],
    }),

    getDishById: build.query<IDish, { id: number }>({
      query: ({ id }) => ({
        url: `/dishes/${id}`,
      }),

      providesTags: (_result, _error, arg) => [{ type: "Dish", id: arg.id }],
    }),

    createDish: build.mutation<IDish, ICreateDishRequest>({
      query: (data) => ({
        url: "/dishes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Dish", id: "LIST" }],
    }),

    deleteDish: build.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/dishes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Dish", id: "LIST" },
        { type: "Dish", id: arg.id },
      ],
    }),
  }),
});

export const {
  useCreateDishMutation,
  useDeleteDishMutation,
  useGetDishByIdQuery,
  useGetDishesQuery,
} = dishApi;
