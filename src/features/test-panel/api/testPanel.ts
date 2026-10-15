import { baseApi } from "@/shared/api";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  createExternalSupply,
  createShortLifeSupply,
  seedRestaurant,
  type TestRequest,
} from "../model/workflows";

const tags = [
  "Product",
  "Dish",
  "Store",
  "Supply",
  "Order",
  "Recommendation",
  "Statistic",
] as const;

export const testPanelApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    resetTestData: build.mutation<Record<string, unknown>, void>({
      query: () => ({
        url: "/test/reset",
        method: "POST",
        body: { confirmation: "RESET" },
      }),
      invalidatesTags: [...tags],
    }),
    prepareTestData: build.mutation<
      { message: string; supplyId: number },
      "seed" | "external" | "short-life"
    >({
      async queryFn(mode, _api, _extra, baseQuery) {
        const request: TestRequest = async (url, method = "GET", body) => {
          const response = await baseQuery({
            url,
            method,
            ...(body === undefined ? {} : { body }),
          });
          if (response.error) throw response.error;
          return response.data as never;
        };
        const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        try {
          if (mode === "short-life") {
            const supply = await createShortLifeSupply(request, token);
            return {
              data: {
                supplyId: supply.id,
                message: `Поставка № ${supply.id} принята на склад. Срок годности партий — 1 и 2 минуты (при одной позиции — 1 минута).`,
              },
            };
          }
          if (mode === "external") {
            const supply = await createExternalSupply(request, token);
            return {
              data: {
                supplyId: supply.id,
                message: `Поставка № ${supply.id} оформлена со статусом «В пути»`,
              },
            };
          }
          const result = await seedRestaurant(request, token);
          return {
            data: {
              supplyId: result.supplyId,
              message: `Создано продуктов: ${result.products}, блюд: ${result.dishes}. Поставка № ${result.supplyId} принята на склад.`,
            },
          };
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? ({
                    status: "CUSTOM_ERROR",
                    error: error.message,
                    data: { message: error.message },
                  } as FetchBaseQueryError)
                : (error as FetchBaseQueryError),
          };
        }
      },
      // A multi-step operation can leave completed steps even when a later request fails.
      invalidatesTags: [...tags],
    }),
  }),
});

export const { useResetTestDataMutation, usePrepareTestDataMutation } =
  testPanelApi;
