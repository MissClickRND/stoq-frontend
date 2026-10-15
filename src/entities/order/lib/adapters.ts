import type { Order, OrderDraft, OrderType, OrderStatus } from '../model/type.ts';

export interface OrderResponse {
  id: number;
  date: string;
  type: OrderType;
  table: number | null;
  guests: number;
  status: string;
  totalPrice?: number | null;
  items: { dishId: number; quantity: number; name?: string | null; price?: number | null;
    totalPrice?: number | null; imageURL?: string | null }[];
}

export function toCreateOrderRequest(draft: Pick<OrderDraft, 'createdAt' | 'type' | 'table' | 'guests'> & {
  items: { dishId: string; quantity: number | string }[];
}) {
  const date = draft.createdAt && new Date(draft.createdAt.replace(' ', 'T'));
  if (!date || !Number.isFinite(date.getTime())) throw new Error('Укажите дату заказа');
  const guests = Number(draft.guests);
  const table = draft.type === 'dine-in' ? Number(draft.table) : null;
  if (!['dine-in', 'takeaway'].includes(draft.type) || !Number.isSafeInteger(guests) || guests < 1 ||
    (table !== null && (!Number.isSafeInteger(table) || table < 1))) throw new Error('Проверьте тип заказа, стол и количество гостей');
  if (!draft.items.length) throw new Error('Добавьте хотя бы одно блюдо');
  return { date: date.toISOString(), type: draft.type, table, guests,
    items: draft.items.map((item) => {
      const dishId = Number(item.dishId), quantity = Number(item.quantity);
      if (!Number.isSafeInteger(dishId) || dishId < 1 || !Number.isSafeInteger(quantity) || quantity < 1)
        throw new Error('Выберите блюда из каталога и положительное целое количество');
      return { dishId, quantity };
    }) };
}

export function toOrder(source: OrderResponse): Order {
  const statuses: Record<string, OrderStatus> = {
    pending_reservation: 'pending', created: 'processing', confirmed: 'preparing',
    completed: 'completed', rejected: 'rejected', cancelled: 'cancelled',
  };
  return { id: String(source.id), createdAt: source.date, type: source.type, table: source.table,
    guests: source.guests, responsible: '—', totalPrice: source.totalPrice ?? null,
    status: statuses[source.status] ?? 'pending',
    items: source.items.map((item) => {
      return { dishId: String(item.dishId), quantity: item.quantity,
        name: item.name ?? `Блюдо #${item.dishId}`, price: item.price ?? null,
        totalPrice: item.totalPrice ?? null, imageUrl: item.imageURL ?? undefined };
    }) };
}
