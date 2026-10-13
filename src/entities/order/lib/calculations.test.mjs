import { test } from "node:test";
import assert from "node:assert/strict";
import {
  orderTotal,
  getTodayOrderStatistics,
  validateOrderDraft,
  addOrderDish,
} from "./calculations.ts";

const item = { dishId: "one", name: "Стейк", price: 99.99, quantity: 2 };

test("order money uses quantities and rounds to cents", () => {
  assert.equal(
    orderTotal([
      { ...item, quantity: 3 },
      { ...item, dishId: "two", price: 12.5, quantity: 2 },
    ]),
    324.97,
  );
  assert.equal(orderTotal([]), 0);
});

test("today counters exclude old orders and revenue counts completed orders", () => {
  const orders = [
    { createdAt: "2026-10-11 09:00:00", status: "completed", items: [item], totalPrice: 199.98 },
    { createdAt: "2026-10-11 10:00:00", status: "processing", items: [item] },
    { createdAt: "2026-10-11 11:00:00", status: "preparing", items: [item] },
    { createdAt: "2026-10-10 09:00:00", status: "completed", items: [item] },
  ];
  assert.deepEqual(getTodayOrderStatistics(orders, "2026-10-11"), {
    total: 3,
    completed: 1,
    revenue: 199.98,
    processing: 2,
  });
});

test("choosing a dish again increases its quantity instead of duplicating a position", () => {
  const source = [item];
  const result = addOrderDish(source, {
    dishId: "one",
    name: "Стейк",
    price: 99.99,
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 3);
  assert.equal(source[0].quantity, 2);
});

test("dine-in requires table 1-10, takeaway does not, quantities and guests must be positive integers", () => {
  const valid = {
    createdAt: "2026-10-11 11:00:00",
    type: "dine-in",
    table: "10",
    guests: 2,
    items: [item],
  };
  assert.deepEqual(validateOrderDraft(valid), {});
  assert.ok(validateOrderDraft({ ...valid, table: "11" }).table);
  assert.deepEqual(
    validateOrderDraft({ ...valid, type: "takeaway", table: null }),
    {},
  );
  assert.ok(validateOrderDraft({ ...valid, guests: 0 }).guests);
  assert.ok(validateOrderDraft({ ...valid, guests: 1.5 }).guests);
  assert.ok(validateOrderDraft({ ...valid, items: [] }).items);
  assert.ok(
    validateOrderDraft({ ...valid, items: [{ ...item, quantity: "" }] }).items,
  );
  assert.ok(
    validateOrderDraft({ ...valid, items: [{ ...item, quantity: 0.5 }] }).items,
  );
  assert.ok(validateOrderDraft({ ...valid, createdAt: null }).createdAt);
});
