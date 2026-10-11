import dayjs from "dayjs";
import { mockDishes } from "../../dish/@x/order.ts";
import type { Order } from "./type";

export function createMockOrders(): Order[] {
  const now = dayjs();
  const names = ["Анна Петрова", "Иван Соколов", "Мария Кузнецова"];
  const statuses: Order["status"][] = ["processing", "preparing", "completed"];
  return Array.from({ length: 8 }, (_, index) => ({
    id: String(10248 - index),
    createdAt: (index < 6
      ? now.subtract(index * 18, "minute")
      : now.subtract(1, "day").subtract(index * 15, "minute")
    ).format("YYYY-MM-DD HH:mm:ss"),
    type: index % 3 === 2 ? "takeaway" : "dine-in",
    table: index % 3 === 2 ? null : index + 1,
    guests: 1 + (index % 4),
    responsible: names[index % names.length],
    status: statuses[index % statuses.length],
    items: mockDishes
      .slice(index % 3, (index % 3) + 2 + (index % 2))
      .map((dish, dishIndex) => ({
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        imageUrl: dish.imageUrl,
        quantity: 1 + (dishIndex % 2),
      })),
  }));
}

export const mockOrders = createMockOrders();

export const mockGuestOrder: import("./type").GuestOrderPayload = {
  restaurantId: "restaurant-1",
  source: "guest",
  createdAt: mockOrders[0].createdAt,
  type: mockOrders[0].type,
  table: mockOrders[0].table,
  guests: mockOrders[0].guests,
  guestName: null,
  comment: null,
  items: mockOrders[0].items,
  total: mockOrders[0].items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  ),
};
