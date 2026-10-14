import { baseApi } from "@/shared/api";
import { IDishStatisticResponse, IOrderStatisticResponse } from "../model/type";

export const statisticApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDishStatistic: build.query<IDishStatisticResponse, void>({
      query: () => "/statistics/dishes",
      providesTags: [{ type: "Statistic", id: "Dish" }],
    }),
    getOrderStatistic: build.query<IOrderStatisticResponse, void>({
      query: () => "/statistics/orders/today",
      providesTags: [{ type: "Statistic", id: "Order" }],
    }),
  }),
});
export const { useGetDishStatisticQuery, useGetOrderStatisticQuery } =
  statisticApi;
