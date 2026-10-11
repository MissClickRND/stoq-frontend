import { mockProducts } from "../model/mock.ts";
export function useProducts() {
  //! Подключить запрос каталога продуктов с поиском и пагинацией.
  return { products: mockProducts };
}
