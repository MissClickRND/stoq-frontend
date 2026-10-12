import { test } from "node:test";
import assert from "node:assert/strict";
import { saveDish, archiveDish } from "../src/entities/dish/api/commands.ts";
import {
  useOrders,
  createOrder,
  completeOrder,
  createGuestOrder,
} from "../src/entities/order/api/order.ts";
import {
  useRestaurant,
  getRestaurants,
  saveRestaurant,
} from "../src/entities/restaurant/api/restaurant.ts";
import {
  useEmployees,
  changeRole,
  toggleBlock,
  approveEmployee,
} from "../src/entities/employee/api/employee.ts";
import {
  useInvitations,
  createInvitation,
  revokeInvitation,
  deleteInvitation,
} from "../src/entities/invitation/api/invitation.ts";
import {
  submitLogin,
  submitEmployeeRegistration,
  submitRestaurantRegistration,
} from "../src/entities/auth/api/commands.ts";

const snapshot = () =>
  JSON.stringify({
    orders: useOrders().orders,
    restaurant: useRestaurant().restaurant,
    restaurants: getRestaurants(),
    employees: useEmployees().employees,
    invitations: useInvitations().invitations,
  });

test("backend command placeholders do not mutate fixtures or manufacture saved results", () => {
  const before = snapshot();
  const dish = { id: "27", name: "Омлет", description: "", price: 520, ingredients: [], stopped: false };
  const order = useOrders().orders[0];
  const results = [
    saveDish({ ...dish, name: "Changed" }, dish.id),
    archiveDish(dish.id),
    createOrder(order),
    completeOrder(order.id),
    createGuestOrder({
      ...order,
      restaurantId: "restaurant-1",
      source: "guest",
    }),
    saveRestaurant({ ...useRestaurant().restaurant, name: "Changed" }),
    changeRole("ivan", "WAITER"),
    toggleBlock("ivan"),
    approveEmployee("artem"),
    createInvitation("WAITER", 24),
    revokeInvitation("invite-active"),
    deleteInvitation("invite-active"),
    submitLogin({ email: "user@example.com", password: "password" }),
    submitEmployeeRegistration({
      name: "User",
      email: "user@example.com",
      restaurantId: "restaurant-1",
    }),
    submitRestaurantRegistration({
      name: "New",
      city: "Москва",
      email: "user@example.com",
      password: "password",
    }),
  ];
  assert.ok(results.every((result) => result === undefined));
  assert.equal(snapshot(), before);
});
