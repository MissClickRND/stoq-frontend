import {
  useCreateGuestOrderMutation,
  readGuestReceipt,
  saveGuestReceipt,
  toCreateOrderRequest,
  toOrder,
  addOrderDish,
  orderTotal,
  type OrderItemDraft,
  type OrderType,
  type Order,
  guestMenuPath,
  getOrderStockError,
  type OrderStockError,
} from "@/entities/order";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type Dish, useGuestMenu, dishCanBeOrdered } from "@/entities/dish";

import type { Restaurant } from "@/entities/restaurant";

export type GuestCheckoutDetails = {
  type: OrderType;
  table: string | null;
  guests: number | string;
  guestName: string;
  comment: string;
};
type GuestOrderContextValue = {
  restaurant: Restaurant;
  basePath: string;
  items: OrderItemDraft[];
  total: number;
  quantity: number;
  details: GuestCheckoutDetails;
  updateDetails: (patch: Partial<GuestCheckoutDetails>) => void;
  addDish: (dish: Dish) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeDish: (id: string) => void;
  submitOrder: () => Promise<Order>;
  isSubmitting: boolean;
  lastOrder: Order | null;
  stockError: OrderStockError | null;
};
const GuestOrderContext = createContext<GuestOrderContextValue | null>(null);

export function GuestOrderProvider({
  restaurant,
  children,
}: {
  restaurant: Restaurant;
  children: ReactNode;
}) {
  const { dishes } = useGuestMenu(restaurant.id);
  const [createOrder, { isLoading: isSubmitting }] = useCreateGuestOrderMutation();
  const submitting = useRef(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(() => {
    try { return readGuestReceipt(window.sessionStorage, restaurant.id); } catch { return null; }
  });
  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [stockError, setStockError] = useState<OrderStockError | null>(null);
  const [details, setDetails] = useState<GuestCheckoutDetails>({
    type: "dine-in",
    table: null,
    guests: 1,
    guestName: "",
    comment: "",
  });
  const addDish = (dish: Dish) => {
    if (submitting.current) return;
    if (!dishCanBeOrdered(dish)) return;
    setItems((current) =>
      addOrderDish(current, {
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        imageUrl: dish.imageUrl,
      }),
    );
  };
  const setQuantity = (id: string, quantity: number) => {
    if (submitting.current) return;
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setItems((current) =>
      current.map((item) =>
        item.dishId === id ? { ...item, quantity } : item,
      ),
    );
  };
  const removeDish = (id: string) => {
    if (submitting.current) return;
    setItems((current) => current.filter((item) => item.dishId !== id));
  };
  const submitOrder = async () => {
    if (submitting.current) throw new Error("Заказ уже отправляется.");
    const payload = toCreateOrderRequest({
      createdAt: new Date().toISOString(),
      type: details.type,
      table: details.table,
      guests: details.guests,
      items,
    });
    submitting.current = true;
    try {
      setStockError(null);
      const response = await createOrder({ restaurantId: restaurant.id, order: payload }).unwrap();
      const order = toOrder(response);
      setLastOrder(order);
      try { saveGuestReceipt(window.sessionStorage, restaurant.id, order); } catch { /* Storage may be disabled. */ }
      setItems([]);
      return order;
    } catch (error) {
      const failure = getOrderStockError(error, items, dishes);
      setStockError(failure);
      throw new Error(failure.message);
    } finally {
      submitting.current = false;
    }
  };
  return (
    <GuestOrderContext.Provider
      value={{
        restaurant,
        basePath: guestMenuPath(restaurant.id),
        items,
        total: orderTotal(items),
        quantity: items.reduce((sum, item) => sum + Number(item.quantity), 0),
        details,
        updateDetails: (patch) => {
          if (!submitting.current)
            setDetails((current) => ({ ...current, ...patch }));
        },
        addDish,
        setQuantity,
        removeDish,
        submitOrder,
        isSubmitting,
        lastOrder,
        stockError,
      }}
    >
      {children}
    </GuestOrderContext.Provider>
  );
}

export function useGuestOrder() {
  const context = useContext(GuestOrderContext);
  if (!context) throw new Error("useGuestOrder requires GuestOrderProvider");
  return context;
}
