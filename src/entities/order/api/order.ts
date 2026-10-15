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
        "Order",
        { type: "Dish", id: "LIST" },
        { type: "Store", id: "LIST" },
      ],
    }),
    createGuestOrder: build.mutation<OrderResponse, CreateOrderRequest>({
      query: body => ({ url: "/orders", method: "POST", body, credentials: "omit" }),
      invalidatesTags: [{ type: "Dish", id: "GUEST_MENU" }],
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
  useCreateGuestOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
} = ordersApi;
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
