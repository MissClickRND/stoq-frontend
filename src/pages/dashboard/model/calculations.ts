import type { Order } from "@/entities/order";
import type { IDish } from "@/entities/dish";
import type { IStoreProduct } from "@/entities/store";
import type { LowStockProduct } from "./type";

export type DashboardPoint = { date: string; revenue: number | null; earning: number | null; orders: number };
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export function getDashboardStatistics(orders: Order[], dishes: IDish[] | undefined, days: number, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);
  const points: DashboardPoint[] = [];
  const byDay = new Map<string, DashboardPoint>();
  for (let index = 0; index < days; index++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const point = { date: date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }), revenue: 0, earning: 0, orders: 0 };
    points.push(point);
    byDay.set(dayKey(date), point);
  }
  const costs = new Map(dishes?.map(dish => [String(dish.id), dish.costPrice]));
  let completed = 0;
  for (const order of orders) {
    if (order.status === "rejected" || order.status === "cancelled") continue;
    const date = new Date(order.createdAt);
    if (!Number.isFinite(date.getTime()) || date > now) continue;
    const point = byDay.get(dayKey(date));
    if (!point) continue;
    point.orders++;
    if (order.status !== "completed") continue;
    completed++;
    const revenue = order.totalPrice;
    const knownRevenue = revenue !== null && Number.isFinite(revenue);
    point.revenue = point.revenue === null || !knownRevenue ? null : money(point.revenue + revenue);
    let cost = 0;
    let knownCost = true;
    for (const item of order.items) {
      const unitCost = costs.get(item.dishId);
      if (unitCost == null || !Number.isFinite(unitCost) || unitCost < 0) knownCost = false;
      else cost += unitCost * item.quantity;
    }
    point.earning = point.earning === null || !knownRevenue || !knownCost ? null : money(point.earning + revenue! - cost);
  }
  const total = (key: "revenue" | "earning") => points.some(point => point[key] === null)
    ? null : money(points.reduce((sum, point) => sum + point[key]!, 0));
  const revenue = total("revenue");
  return { points, revenue, earning: total("earning"), orders: points.reduce((sum, point) => sum + point.orders, 0),
    completed, averageCheck: revenue === null ? null : completed ? money(revenue / completed) : 0 };
}

export function getLowStockProducts(batches: IStoreProduct[], now = new Date()): LowStockProduct[] {
  const grouped = new Map<number, LowStockProduct & { allLow: boolean }>();
  for (const batch of batches) {
    const quantity = Number(batch.availableQuantity ?? batch.Quantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || batch.status === "DEPLETED" || new Date(batch.expiresAt) <= now) continue;
    const entry = grouped.get(batch.productId) ?? { product: batch.product, quantity: 0, allLow: true };
    entry.quantity += quantity;
    entry.allLow &&= batch.status === "RUNNINGOUT";
    grouped.set(batch.productId, entry);
  }
  // A nearly empty batch must not flag a product with a full second batch.
  return [...grouped.values()].filter(entry => entry.allLow && entry.quantity <= 10)
    .sort((a, b) => a.quantity - b.quantity || a.product.name.localeCompare(b.product.name, "ru"));
}
