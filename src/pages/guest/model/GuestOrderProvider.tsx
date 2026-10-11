import { createContext, useContext, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import type { Dish } from "@/pages/dishes/model/type";
import { useDishes } from "@/pages/dishes/model/DishesProvider";
import { dishIsStopped } from "@/pages/dishes/model/calculations";
import { addOrderDish, orderTotal } from "@/pages/orders/model/calculations";
import type { OrderItemDraft, OrderType } from "@/pages/orders/model/type";
import type { MockRestaurant } from "@/shared/api/auth-mock/type";
import {
  buildGuestOrderPayload,
  guestMenuPath,
  type GuestOrderPayload,
} from "./guest-order";

export type GuestCheckoutDetails = {
  type: OrderType;
  table: string | null;
  guests: number | string;
  guestName: string;
  comment: string;
};
type GuestOrderContextValue = {
  restaurant: MockRestaurant;
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
  lastOrder: GuestOrderPayload | null;
};
const GuestOrderContext = createContext<GuestOrderContextValue | null>(null);

export function GuestOrderProvider({
  restaurant,
  children,
}: {
  restaurant: MockRestaurant;
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
  const [lastOrder, setLastOrder] = useState<GuestOrderPayload | null>(null);
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
    console.info("[mock] Гостевой заказ", payload);
    setLastOrder(payload);
    setItems([]);
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
        lastOrder,
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
