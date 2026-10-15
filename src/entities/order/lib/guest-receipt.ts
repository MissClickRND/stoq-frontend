import type { Order } from "../model/type.ts";

// Keep only the receipt returned by POST, in this tab. Guests cannot GET arbitrary orders.
export function readGuestReceipt(storage: Pick<Storage, "getItem">, restaurantId: string): Order | null {
  try {
    const order: unknown = JSON.parse(storage.getItem(`stoq.guest.receipt:${restaurantId}`) ?? "null");
    if (!order || typeof order !== "object") return null;
    const receipt = order as Partial<Order>;
    if (typeof receipt.id !== "string" || !/^\d+$/.test(receipt.id) ||
      !["dine-in", "takeaway"].includes(receipt.type ?? "") ||
      !Number.isInteger(receipt.guests) || !Array.isArray(receipt.items) ||
      (receipt.totalPrice !== null && (typeof receipt.totalPrice !== "number" || !Number.isFinite(receipt.totalPrice)))) return null;
    return receipt as Order;
  } catch { return null; }
}

export function saveGuestReceipt(storage: Pick<Storage, "setItem">, restaurantId: string, order: Order): void {
  try { storage.setItem(`stoq.guest.receipt:${restaurantId}`, JSON.stringify(order)); }
  catch { /* A successful order remains successful if browser storage is unavailable. */ }
}
