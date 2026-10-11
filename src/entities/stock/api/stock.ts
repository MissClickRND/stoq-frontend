import { mockStock } from "../model/mock.ts";
export function removeProduct(_id: string): void {
  //! Подключить списание складской позиции по ID; обновить остатки после ответа сервера.
}
export function useStoreProducts() {
  //! Подключить запрос складских остатков, статистики, поиска и пагинации.
  return { products: mockStock, isLoading: false, removeProduct };
}
