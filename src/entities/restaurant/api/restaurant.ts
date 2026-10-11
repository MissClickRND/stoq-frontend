import { mockRestaurants, mockRestaurantSettings } from "../model/mock.ts";
import type { RestaurantSettings } from "../model/type.ts";
export function getRestaurants() {
  //! Подключить запрос списка заведений для регистрации и гостевого меню.
  return mockRestaurants;
}
export function useRestaurant() {
  //! Подключить запрос текущего заведения (ID из авторизованной сессии).
  return { restaurant: mockRestaurantSettings };
}
export function saveRestaurant(_settings: RestaurantSettings): void {
  //! Подключить обновление настроек заведения и отобразить ответ сервера.
}

export function useGuestRestaurant(id: string | undefined) {
  //! Подключить публичный запрос заведения по ID из гостевой ссылки.
  return {
    restaurant: mockRestaurants.find((restaurant) => restaurant.id === id),
  };
}
