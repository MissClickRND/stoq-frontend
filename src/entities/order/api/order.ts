import { baseApi } from "@/shared/api";
import { toOrder, type OrderResponse } from "../lib/adapters.ts";

type CreateOrderRequest = {
  date: string; type: "dine-in" | "takeaway"; table: number | null; guests: number;
  items: { dishId: number; quantity: number }[];
};

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
      invalidatesTags: [
        "Order", "Statistic", "Activity",
        { type: "Dish", id: "LIST" },
        { type: "Store", id: "LIST" },
      ],
    }),
    createGuestOrder: build.mutation<OrderResponse, { restaurantId: string; order: CreateOrderRequest }>({
      query: ({ restaurantId, order }) => ({
        url: "/orders", method: "POST", body: order, credentials: "omit",
        headers: { "X-Restaurant-Id": restaurantId },
      }),
      invalidatesTags: (_result, _error, { restaurantId }) => [{ type: "Dish", id: `GUEST_MENU:${restaurantId}` }],
    }),
    completeOrder: build.mutation<OrderResponse, { id: number }>({
      query: ({ id }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status: "completed" },
      }),
      invalidatesTags: ["Order", "Statistic", "Activity"],
    }),
    rejectOrder: build.mutation<OrderResponse, { id: number }>({
      query: ({ id }) => ({ url: `/orders/${id}/status`, method: "PATCH", body: { status: "rejected" } }),
      invalidatesTags: ["Order", "Statistic", "Activity"],
    }),
  }),
});
export const {
  useCreateOrderMutation,
  useCreateGuestOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
} = ordersApi;
export function useOrders() {
  const query = useGetOrdersQuery();
  const [complete, completing] = ordersApi.useCompleteOrderMutation();
  const [reject, rejecting] = ordersApi.useRejectOrderMutation();
  return {
    ...query,
    orders: (query.data ?? []).map(toOrder),
    refetch: () => {
      void query.refetch();
    },
    completeOrder: (id: string) => complete({ id: Number(id) }).unwrap(),
    rejectOrder: (id: string) => reject({ id: Number(id) }).unwrap(),
    isUpdating: completing.isLoading || rejecting.isLoading,
  };
}

export function useGuestOrderResult(
  id?: string | null,
  options?: { skip?: boolean },
) {
  const numericId = Number(id);
  const query = useGetOrderByIdQuery(
    { id: numericId },
    {
      skip: options?.skip || !Number.isSafeInteger(numericId) || numericId <= 0,
    },
  );
  return {
    ...query,
    order: query.currentData ? toOrder(query.currentData) : undefined,
  };
}
