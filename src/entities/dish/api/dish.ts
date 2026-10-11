import { mockDishes, ingredientCatalog } from "../model/mock.ts";
import type { DishDraft } from "../model/type.ts";
export function saveDish(_draft: DishDraft, _id?: string): void {
  //! Подключить создание/обновление блюда; обновлять запрос меню после ответа сервера.
}
export function archiveDish(_id: string): void {
  //! Подключить архивацию блюда и обновление меню после ответа сервера.
}
export function useDishes() {
  //! Подключить запрос списка блюд (включая доступность, рекомендации и продажи).
  return { dishes: mockDishes, saveDish, archiveDish };
}
export function useIngredients() {
  //! Подключить запрос доступных ингредиентов для состава блюда.
  return { ingredients: ingredientCatalog };
}
