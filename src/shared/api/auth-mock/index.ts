import { mockRestaurants } from "./data";
import type {
  EmployeeRegistrationRequest,
  LoginRequest,
  MockRestaurant,
  RestaurantRegistrationRequest,
} from "./type";

const restaurants = [...mockRestaurants];
export const getMockRestaurants = () =>
  restaurants.map((restaurant) => ({ ...restaurant }));

export function updateMockRestaurant(restaurant: MockRestaurant) {
  const index = restaurants.findIndex((item) => item.id === restaurant.id);
  if (index >= 0) restaurants[index] = { ...restaurant };
}

export async function submitMockLogin(request: LoginRequest) {
  console.info("[mock] Вход в аккаунт", { ...request, password: "[скрыто]" });
  return { email: request.email };
}

export async function submitMockRestaurantRegistration(
  request: RestaurantRegistrationRequest,
) {
  const restaurant: MockRestaurant = {
    id: crypto.randomUUID(),
    name: request.name,
    city: request.city,
  };
  const owner = {
    email: request.email,
    role: "OWNER" as const,
    restaurantId: restaurant.id,
  };
  restaurants.push(restaurant);
  console.info("[mock] Регистрация ресторана", {
    ...request,
    password: "[скрыто]",
    restaurantId: restaurant.id,
    ownerRole: owner.role,
  });
  return { restaurant, owner };
}

export async function submitMockEmployeeRegistration(
  request: EmployeeRegistrationRequest,
) {
  const restaurant = restaurants.find(
    (item) => item.id === request.restaurantId,
  );
  if (!restaurant) throw new Error("Ресторан не найден");
  console.info("[mock] Заявка сотрудника", {
    ...request,
    restaurantName: restaurant.name,
    status: "pending",
  });
  return { id: crypto.randomUUID(), restaurant, status: "pending" as const };
}
