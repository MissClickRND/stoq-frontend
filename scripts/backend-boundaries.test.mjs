import { test } from "node:test";
import assert from "node:assert/strict";
import { saveDish, archiveDish } from "../src/entities/dish/api/commands.ts";
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

const snapshot = () =>
  JSON.stringify({
    restaurant: useRestaurant().restaurant,
    restaurants: getRestaurants(),
    employees: useEmployees().employees,
    invitations: useInvitations().invitations,
  });

test("backend command placeholders do not mutate fixtures or manufacture saved results", () => {
  const before = snapshot();
  const dish = { id: "27", name: "Омлет", description: "", price: 520, ingredients: [], stopped: false };
  const results = [
    saveDish({ ...dish, name: "Changed" }, dish.id),
    archiveDish(dish.id),
    saveRestaurant({ ...useRestaurant().restaurant, name: "Changed" }),
    changeRole("ivan", "WAITER"),
    toggleBlock("ivan"),
    approveEmployee("artem"),
    createInvitation("WAITER", 24),
    revokeInvitation("invite-active"),
    deleteInvitation("invite-active"),
  ];
  assert.ok(results.every((result) => result === undefined));
  assert.equal(snapshot(), before);
});
