import { test } from "node:test";
import assert from "node:assert/strict";
import { getGuestMenuDishes, GUEST_MENU_PAGE_SIZE } from "./guest-menu.ts";

const dishes = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  name: `Dish ${i + 1}`,
  price: 100,
  priceKnown: true,
  availablePortions: 5,
  stopped: false,
  archived: false,
  description: "",
  ingredients: [],
  sales: [],
}));
const recommendations = Array.from({ length: 14 }, (_, i) => ({
  dishId: 20 - i,
}));

test("ten recommendations lead the catalog without duplicates; pages contain twelve dishes", () => {
  const result = getGuestMenuDishes(dishes, recommendations);
  assert.deepEqual(
    result.slice(0, 10).map((dish) => dish.id),
    Array.from({ length: 10 }, (_, i) => String(20 - i)),
  );
  assert.deepEqual(
    result.slice(10).map((dish) => dish.id),
    dishes
      .filter((dish) => Number(dish.id) < 11 || Number(dish.id) > 20)
      .map((dish) => dish.id),
  );
  assert.equal(new Set(result.map((dish) => dish.id)).size, 25);
  assert.equal(GUEST_MENU_PAGE_SIZE, 12);
  assert.deepEqual(
    [0, 12, 24].map(
      (offset) => result.slice(offset, offset + GUEST_MENU_PAGE_SIZE).length,
    ),
    [12, 12, 1],
  );
  assert.equal(dishes[0].id, "1");
});

test("unavailable, missing, and repeated recommendations never add invalid or duplicate menu entries", () => {
  const catalog = dishes.map((dish) =>
    dish.id === "20" ? { ...dish, availablePortions: 0 } : dish,
  );
  const result = getGuestMenuDishes(catalog, [
    { dishId: 999 },
    { dishId: 20 },
    { dishId: 19 },
    { dishId: 19 },
    ...recommendations,
  ]);
  assert.equal(result[0].id, "19");
  assert.ok(!result.some((dish) => dish.id === "20"));
  assert.equal(result.length, 24);
  assert.equal(new Set(result.map((dish) => dish.id)).size, 24);
});

test("missing recommendations fall back to the available catalog and filtered search stays filtered", () => {
  assert.deepEqual(getGuestMenuDishes(dishes, []), dishes);
  assert.deepEqual(
    getGuestMenuDishes(
      dishes.filter((dish) => dish.id === "25"),
      recommendations,
    ),
    [dishes[24]],
  );
  assert.deepEqual(getGuestMenuDishes([], recommendations), []);
});
