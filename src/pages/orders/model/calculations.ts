import type { Order, OrderDraft, OrderItemDraft } from "./type";

export const orderTotal = (
  items: Pick<OrderItemDraft, "price" | "quantity">[],
) =>
  Math.round(
    (items.reduce(
      (sum, item) => sum + item.price * (Number(item.quantity) || 0),
      0,
    ) +
      Number.EPSILON) *
      100,
  ) / 100;

export function getTodayOrderStatistics(orders: Order[], day: string) {
  const today = orders.filter((order) => order.createdAt.startsWith(day));
  const completed = today.filter((order) => order.status === "completed");
  return {
    total: today.length,
    completed: completed.length,
    revenue:
      Math.round(
        completed.reduce((sum, order) => sum + orderTotal(order.items), 0) *
          100,
      ) / 100,
    processing: today.length - completed.length,
  };
}

export function addOrderDish(
  items: OrderItemDraft[],
  dish: Omit<OrderItemDraft, "quantity">,
): OrderItemDraft[] {
  return items.some((item) => item.dishId === dish.dishId)
    ? items.map((item) =>
        item.dishId === dish.dishId
          ? { ...item, quantity: (Number(item.quantity) || 0) + 1 }
          : item,
      )
    : [{ ...dish, quantity: 1 }, ...items];
}

export function validateOrderDraft(draft: OrderDraft) {
  const errors: Partial<
    Record<"createdAt" | "table" | "guests" | "items", string>
  > = {};
  if (
    !draft.createdAt ||
    !Number.isFinite(Date.parse(draft.createdAt.replace(" ", "T")))
  )
    errors.createdAt = "Укажите дату и время";
  if (
    draft.type === "dine-in" &&
    (!draft.table ||
      !Number.isInteger(Number(draft.table)) ||
      Number(draft.table) < 1 ||
      Number(draft.table) > 10)
  )
    errors.table = "Выберите стол от 1 до 10";
  if (!Number.isInteger(Number(draft.guests)) || Number(draft.guests) < 1)
    errors.guests = "Укажите целое число гостей от 1";
  if (!draft.items.length) errors.items = "Добавьте хотя бы одно блюдо";
  else if (
    draft.items.some(
      (item) =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        !Number.isFinite(item.price) ||
        item.price < 0,
    )
  )
    errors.items = "Укажите количество от 1 для каждого блюда";
  return errors;
}
