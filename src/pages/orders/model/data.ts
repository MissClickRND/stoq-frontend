import dayjs from "dayjs";
import { initialDishes } from "@/pages/dishes/model/data";
import type { Order } from "./type";

export const orderColumns = [
  "№ заказа",
  "Дата и время",
  "Состав",
  "Сумма",
  "Стол / тип",
  "Ответственный",
  "Статус",
  "Действия",
];
export const orderTypeOptions = [
  { value: "dine-in", label: "В зале" },
  { value: "takeaway", label: "На вынос" },
];
export const tableOptions = Array.from({ length: 10 }, (_, index) => ({
  value: String(index + 1),
  label: `Стол ${index + 1}`,
}));
export const orderStatuses = {
  processing: { label: "В обработке", color: "orange" },
  preparing: { label: "Готовится", color: "blue" },
  completed: { label: "Выполнен", color: "green" },
};

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
    items: initialDishes
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
