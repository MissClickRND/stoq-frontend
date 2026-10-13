import { test } from "node:test";
import assert from "node:assert/strict";
import {
  inventoryChange,
  inventoryCounts,
  inventoryEntryError,
} from "./inventory.ts";

const product = {
  id: 27, supplyId: 8, productId: 3, Quantity: 12, price: 100, totalPrice: 1200,
  balance: { availableQuantity: 12, reservedQuantity: 4 },
  product: { id: 3, name: "Помидоры", unit: { id: 2, name: "Килограмм", shortName: "кг" } },
  expiresAt: "2026-10-30T12:00:00Z", status: "ACTIVE",
};
const entries = [
  { product, actual: 1.25, remove: false },
  { product: { ...product, id: "b" }, actual: 0, remove: false },
  { product: { ...product, id: "c" }, actual: 12, remove: true },
  { product: { ...product, id: "d" }, actual: 12, remove: false },
];

test("counts changed quantities, zero stock, explicit removal and unchanged entries separately", () => {
  assert.deepEqual(inventoryCounts(entries), {
    checked: 4,
    updated: 2,
    deleted: 1,
    unchanged: 1,
  });
});

test("preview classifies changes without modifying warehouse records or draft entries", () => {
  const original = structuredClone(entries);
  assert.deepEqual(entries.map(inventoryChange), [
    "updated",
    "updated",
    "deleted",
    "unchanged",
  ]);
  inventoryCounts(entries);
  assert.deepEqual(entries, original);
});

test("blank, negative and invalid counts are rejected but marked removal does not require a count", () => {
  for (const actual of ["", -1, NaN, Infinity])
    assert.ok(inventoryEntryError({ product, actual, remove: false }));
  assert.equal(
    inventoryEntryError({ product, actual: 0, remove: false }),
    null,
  );
  assert.equal(
    inventoryEntryError({ product, actual: "", remove: true }),
    null,
  );
});
