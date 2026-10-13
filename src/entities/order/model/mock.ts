import dayjs from "dayjs";
import type { Order } from "./type";

// Снимки позиций исторических заказов, независимые от текущего меню.
const orderItemSnapshots = [
  { dishId: "salmon-steak", name: "Стейк из лосося", price: 1490 },
  { dishId: "caesar", name: "Салат «Цезарь» с креветками", price: 790 },
  { dishId: "carbonara", name: "Паста «Карбонара»", price: 690 },
  { dishId: "cheesecake", name: "Чизкейк с ягодами", price: 450 },
  { dishId: "burger", name: "Бургер с говядиной", price: 890 },
];

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
    totalPrice: null,
    items: orderItemSnapshots
      .slice(index % 3, (index % 3) + 2 + (index % 2))
      .map((item, dishIndex) => ({
        ...item,
        imageUrl: "https://i.pinimg.com/originals/f6/8c/02/f68c022de85632efc2a1bad16d4f042f.jpg",
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
    (total, item) => total + (item.price ?? 0) * item.quantity,
    0,
  ),
};
