import { test } from "node:test";
import assert from "node:assert/strict";
import { saveDish, archiveDish } from "../src/entities/dish/api/commands.ts";
import {
  useSupplies,
  useSupply,
  createSupply,
} from "../src/entities/supply/api/supply.ts";
import {
  useOrders,
  createOrder,
  completeOrder,
  createGuestOrder,
} from "../src/entities/order/api/order.ts";
import {
  useStoreProducts,
  removeProduct,
} from "../src/entities/stock/api/stock.ts";
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
  useInventoryReport,
  saveInventory,
} from "../src/entities/inventory/api/inventory.ts";
import {
  submitLogin,
  submitEmployeeRegistration,
  submitRestaurantRegistration,
} from "../src/entities/auth/api/commands.ts";

const snapshot = () =>
  JSON.stringify({
    supplies: useSupplies().supplies,
    orders: useOrders().orders,
    stock: useStoreProducts().products,
    restaurant: useRestaurant().restaurant,
    restaurants: getRestaurants(),
    employees: useEmployees().employees,
    invitations: useInvitations().invitations,
    report: useInventoryReport().report,
  });

test("backend command placeholders do not mutate fixtures or manufacture saved results", () => {
  const before = snapshot();
  const dish = { id: "27", name: "Омлет", description: "", price: 520, ingredients: [], stopped: false };
  const supply = useSupplies().supplies[0];
  const order = useOrders().orders[0];
  const report = useInventoryReport().report;
  const results = [
    saveDish({ ...dish, name: "Changed" }, dish.id),
    archiveDish(dish.id),
    createSupply(supply),
    createOrder(order),
    completeOrder(order.id),
    createGuestOrder({
      ...order,
      restaurantId: "restaurant-1",
      source: "guest",
    }),
    removeProduct(useStoreProducts().products[0].id),
    saveRestaurant({ ...useRestaurant().restaurant, name: "Changed" }),
    changeRole("ivan", "WAITER"),
    toggleBlock("ivan"),
    approveEmployee("artem"),
    createInvitation("WAITER", 24),
    revokeInvitation("invite-active"),
    deleteInvitation("invite-active"),
    saveInventory(report.entries, report.date, "User"),
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

test("detail reads share the same fixture records and handle unknown identifiers", () => {
  const supply = useSupplies().supplies[0];
  assert.equal(useSupply(supply.id).supply, supply);
  assert.equal(useSupply("unknown").supply, undefined);
  assert.equal(useSupply(undefined).supply, undefined);
});
