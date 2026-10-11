import {
  createGuestOrder,
  addOrderDish,
  orderTotal,
  type OrderItemDraft,
  type OrderType,
  buildGuestOrderPayload,
  guestMenuPath,
} from "@/entities/order";
import { createContext, useContext, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import { type Dish, useDishes, dishIsStopped } from "@/entities/dish";

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
  submitOrder: () => void;
};
const GuestOrderContext = createContext<GuestOrderContextValue | null>(null);

export function GuestOrderProvider({
  restaurant,
  children,
}: {
  restaurant: Restaurant;
  children: ReactNode;
}) {
  const { dishes } = useDishes();
  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [details, setDetails] = useState<GuestCheckoutDetails>({
    type: "dine-in",
    table: null,
    guests: 1,
    guestName: "",
    comment: "",
  });
  const addDish = (dish: Dish) => {
    if (dish.archived || dishIsStopped(dish)) return;
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
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setItems((current) =>
      current.map((item) =>
        item.dishId === id ? { ...item, quantity } : item,
      ),
    );
  };
  const removeDish = (id: string) =>
    setItems((current) => current.filter((item) => item.dishId !== id));
  const submitOrder = () => {
    if (
      items.some((item) => {
        const dish = dishes.find((entry) => entry.id === item.dishId);
        return !dish || dish.archived || dishIsStopped(dish);
      })
    )
      throw new Error(
        "Одно из блюд временно недоступно. Удалите его из корзины и выберите другое.",
      );
    const payload = buildGuestOrderPayload(
      restaurant.id,
      {
        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        type: details.type,
        table: details.table,
        guests: details.guests,
        items,
      },
      details.guestName,
      details.comment,
    );
    createGuestOrder(payload);
    //! Очистить корзину и показать подтверждение после ответа сервера.
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
        updateDetails: (patch) =>
          setDetails((current) => ({ ...current, ...patch })),
        addDish,
        setQuantity,
        removeDish,
        submitOrder,
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
