import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateItemPrices,
  getMonthStatistics,
  validateItem,
} from "./calculations.ts";

test("fractional quantities calculate money to cents", () => {
  assert.deepEqual(
    calculateItemPrices({ quantity: 1.25, price: 99.99, pricingMode: "unit" }),
    { unitPrice: 99.99, total: 124.99 },
  );
});

test("entered total remains fixed when quantity changes", () => {
  assert.deepEqual(
    calculateItemPrices({ quantity: 3, price: 100, pricingMode: "total" }),
    { unitPrice: 100 / 3, total: 100 },
  );
  assert.deepEqual(
    calculateItemPrices({ quantity: 4, price: 100, pricingMode: "total" }),
    { unitPrice: 25, total: 100 },
  );
});

test("zero quantity never creates an infinite unit price", () => {
  assert.deepEqual(
    calculateItemPrices({ quantity: "", price: 100, pricingMode: "total" }),
    { unitPrice: 0, total: 100 },
  );
});

test("monthly statistics exclude other months and count received positions", () => {
  const supplies = [
    {
      receivedAt: "2026-10-01 10:00:00",
      items: [{ total: 100 }, { total: 50 }],
    },
    { receivedAt: "2026-10-31 23:59:00", items: [{ total: 250 }] },
    { receivedAt: "2026-09-30 23:59:00", items: [{ total: 900 }] },
    { receivedAt: "2025-10-01 10:00:00", items: [{ total: 900 }] },
  ];
  assert.deepEqual(getMonthStatistics(supplies, "2026-10"), {
    count: 2,
    total: 400,
    products: 3,
    average: 200,
  });
  assert.deepEqual(getMonthStatistics([], "2026-10"), {
    count: 0,
    total: 0,
    products: 0,
    average: 0,
  });
});

test("incomplete positions and expiration before receipt are rejected", () => {
  const valid = {
    quantity: 2,
    unitId: 7,
    expiresAt: "2026-10-12 10:00:00",
    price: 100,
    pricingMode: "unit",
  };
  assert.deepEqual(validateItem(valid, "2026-10-11 10:00:00"), {});
  assert.ok(
    validateItem({ ...valid, quantity: "" }, "2026-10-11 10:00:00").quantity,
  );
  assert.ok(validateItem({ ...valid, price: "" }, "2026-10-11 10:00:00").price);
  assert.ok(
    validateItem({ ...valid, expiresAt: null }, "2026-10-11 10:00:00")
      .expiresAt,
  );
  assert.ok(validateItem(valid, "2026-10-13 10:00:00").expiresAt);
  for (const unitId of [null, 0, -1, 1.5, "кг"]) {
    assert.ok(validateItem({ ...valid, unitId }, "2026-10-11 10:00:00").unitId);
  }
});
