import type { DishFormValues } from "../model/type.ts";

export function saveDish(_draft: DishFormValues, _id?: string): void {
  //! Подключить обновление блюда, когда соответствующая операция появится в API.
}

export function archiveDish(_id: string): void {
  // Архивация отключена в интерфейсе; функция сохранена для совместимости.
}
