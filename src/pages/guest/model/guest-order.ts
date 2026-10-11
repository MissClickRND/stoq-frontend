import {
  orderTotal,
  validateOrderDraft,
} from "../../orders/model/calculations.ts";
import type { OrderDraft, OrderItem, OrderType } from "../../orders/model/type";

export const guestMenuPath = (restaurantId: string) =>
  `/order/new/guest/${encodeURIComponent(restaurantId)}`;
export const guestMenuUrl = (origin: string, restaurantId: string) =>
  new URL(guestMenuPath(restaurantId), origin).toString();

export type GuestOrderPayload = {
  restaurantId: string;
  source: "guest";
  createdAt: string;
  type: OrderType;
  table: number | null;
  guests: number;
  guestName: string | null;
  comment: string | null;
  items: OrderItem[];
  total: number;
};

export function buildGuestOrderPayload(
  restaurantId: string,
  draft: OrderDraft,
  guestName: string,
  comment: string,
): GuestOrderPayload {
  const errors = validateOrderDraft(draft);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  return {
    restaurantId,
    source: "guest",
    createdAt: draft.createdAt!,
    type: draft.type,
    table: draft.type === "dine-in" ? Number(draft.table) : null,
    guests: Number(draft.guests),
    guestName: guestName.trim() || null,
    comment: comment.trim() || null,
    items: draft.items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
    })),
    total: orderTotal(draft.items),
  };
}
