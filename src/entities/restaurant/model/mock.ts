import type { Restaurant, RestaurantSettings } from "./type.ts";

export const mockRestaurants: Restaurant[] = [
  { id: "restaurant-1", name: "La Maison", city: "Москва" },
  { id: "restaurant-2", name: "Зелёная кухня", city: "Санкт-Петербург" },
  { id: "restaurant-3", name: "Терраса", city: "Казань" },
  { id: "restaurant-4", name: "La Maison", city: "Сочи" },
];

export const mockRestaurantSettings: RestaurantSettings = {
  id: "restaurant-1",
  name: "La Maison",
  address: "Москва",
  email: "admin@lamaison.ru",
  phone: "+7 (999) 123-45-67",
};
