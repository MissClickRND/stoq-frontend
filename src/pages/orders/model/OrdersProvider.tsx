import { createContext, useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { createMockOrders } from "./data";
import type { Order } from "./type";

type OrdersContextValue = {
  orders: Order[];
  createOrder: (draft: Omit<Order, "id" | "status">) => void;
  completeOrder: (id: string) => void;
};
const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersRoutesLayout() {
  const [orders, setOrders] = useState(createMockOrders);
  const createOrder: OrdersContextValue["createOrder"] = (draft) =>
    setOrders((current) => [
      {
        ...draft,
        id: String(
          Math.max(10248, ...current.map((order) => Number(order.id))) + 1,
        ),
        status: "processing",
      },
      ...current,
    ]);
  const completeOrder = (id: string) =>
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: "completed" } : order,
      ),
    );
  return (
    <OrdersContext.Provider value={{ orders, createOrder, completeOrder }}>
      <Outlet />
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders requires OrdersRoutesLayout");
  return context;
}
