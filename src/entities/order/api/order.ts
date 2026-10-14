import { mockGuestOrder } from "../model/mock.ts";
import type { GuestOrderPayload } from "../model/type.ts";
import { baseApi } from "@/shared/api";
import { toOrder, type OrderResponse } from "../lib/adapters.ts";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<OrderResponse[], void>({
      query: () => "/orders",
      providesTags: ["Order"],
    }),
    getOrderById: build.query<OrderResponse, { id: number }>({
      query: ({ id }) => `/orders/${id}`,
      providesTags: ["Order"],
    }),
    createOrder: build.mutation<
      OrderResponse,
      {
        date: string;
        type: "dine-in" | "takeaway";
        table: number | null;
        guests: number;
        items: { dishId: number; quantity: number }[];
      }
    >({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),
    completeOrder: build.mutation<OrderResponse, { id: number }>({
      query: ({ id }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status: "completed" },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});
export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
} = ordersApi;
export function createGuestOrder(_payload: GuestOrderPayload): void {
  //! Подключить гостевое создание заказа; очистить корзину и открыть подтверждение после ответа сервера.
}
export function useOrders() {
  const query = useGetOrdersQuery();
  const [complete] = ordersApi.useCompleteOrderMutation();
  return {
    ...query,
    orders: (query.data ?? []).map(toOrder),
    refetch: () => {
      void query.refetch();
    },
    completeOrder: (id: string) => complete({ id: Number(id) }).unwrap(),
  };
}

export function useGuestOrderResult(_restaurantId: string) {
  //! Подключить запрос результата гостевого заказа по ID, полученному при создании.
  return { order: mockGuestOrder };
}
