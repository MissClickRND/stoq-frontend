import { mockOrders, mockGuestOrder } from "../model/mock.ts";
import type { Order, GuestOrderPayload } from "../model/type.ts";

export function createOrder(_draft: Omit<Order, "id" | "status">): void {
  //! Подключить создание заказа; статус, ID, цены и сумму подтвердить ответом сервера.
}
export function completeOrder(_id: string): void {
  //! Подключить завершение заказа и обновлять данные после ответа сервера.
}
export function createGuestOrder(_payload: GuestOrderPayload): void {
  //! Подключить гостевое создание заказа; очистить корзину и открыть подтверждение после ответа сервера.
}
export function useOrders() {
  //! Подключить запрос заказов и статистики за выбранный день.
  return { orders: mockOrders, createOrder, completeOrder };
}

export function useGuestOrderResult(_restaurantId: string) {
  //! Подключить запрос результата гостевого заказа по ID, полученному при создании.
  return { order: mockGuestOrder };
}
