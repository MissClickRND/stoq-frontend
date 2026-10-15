import { baseApi } from "@/shared/api";
import type { IDishStatisticResponse, IOrderStatisticResponse, DashboardStatistic, DishDetailsStatistic, ShortageStatistic, InventoryStatistic, WriteOff, SupplyStatistic, SupplyDetailsStatistic, AdminStatistic } from "../model/type";
export const statisticsQueryOptions = { pollingInterval: 30000, refetchOnMountOrArgChange: true } as const;
export const statisticApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDishStatistic: build.query<IDishStatisticResponse, void>({ query: () => "/statistics/dishes", providesTags: ["Statistic"] }),
    getOrderStatistic: build.query<IOrderStatisticResponse, void>({ query: () => "/statistics/orders/today", providesTags: ["Statistic"] }),
    getDashboardStatistic: build.query<DashboardStatistic, number>({ query: days => ({ url: "/statistics/dashboard", params: { days } }), providesTags: ["Statistic"] }),
    getDishDetailsStatistic: build.query<DishDetailsStatistic, { id: number; days: number }>({ query: ({ id, days }) => ({ url: `/statistics/dishes/${id}`, params: { days } }), providesTags: ["Statistic"] }),
    getShortageStatistic: build.query<ShortageStatistic, number>({ query: days => ({ url: "/statistics/shortages", params: { days } }), providesTags: ["Statistic"] }),
    getInventoryStatistic: build.query<InventoryStatistic, void>({ query: () => "/inventory/statistics", providesTags: ["Statistic", "Store"] }),
    getWriteOffs: build.query<WriteOff[], void>({ query: () => "/inventory/write-offs", providesTags: ["Statistic", "Store"] }),
    getSupplyStatistic: build.query<SupplyStatistic, void>({ query: () => "/statistics/supplies", providesTags: ["Statistic", "Supply"] }),
    getSupplyDetailsStatistic: build.query<SupplyDetailsStatistic, number>({ query: id => `/statistics/supplies/${id}`, providesTags: ["Statistic", "Supply"] }),
    getAdminStatistic: build.query<AdminStatistic, void>({ query: () => "/auth/admin/statistics", providesTags: ["Statistic", "User"] }),
  }),
});
export const { useGetDishStatisticQuery, useGetOrderStatisticQuery, useGetDashboardStatisticQuery, useGetDishDetailsStatisticQuery, useGetShortageStatisticQuery, useGetInventoryStatisticQuery, useGetWriteOffsQuery, useGetSupplyStatisticQuery, useGetSupplyDetailsStatisticQuery, useGetAdminStatisticQuery } = statisticApi;
