import { mockUnits } from "../model/mock.ts";
export function createUnit(_name: string): void {
  //! Подключить создание единицы измерения; выбирать её только после ответа сервера.
}
export function useUnits() {
  //! Подключить запрос единиц измерения.
  return { units: mockUnits, addUnit: createUnit };
}
