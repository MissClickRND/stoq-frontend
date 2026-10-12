import { baseApi } from "@/shared/api";
import type { ICreateUnitRequest, IUnit } from "../model/type";

export const unitApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUnits: build.query<IUnit[], void>({
      query: () => ({
        url: "/product/units",
      }),
      providesTags: [{ type: "Unit", id: "LIST" }],
    }),

    getUnitById: build.query<IUnit, { id: number }>({
      query: ({ id }) => ({
        url: `/product/units/${id}`,
      }),
      providesTags: (_result, _error, arg) => [{ type: "Unit", id: arg.id }],
    }),

    createUnit: build.mutation<IUnit, ICreateUnitRequest>({
      query: (data) => ({
        url: "/product/units",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Unit", id: "LIST" }],
    }),
  }),
});

export const { useCreateUnitMutation, useGetUnitByIdQuery, useGetUnitsQuery } =
  unitApi;
