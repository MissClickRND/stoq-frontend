import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyInventoryToProducts,
  inventoryCounts,
  inventoryEntryError,
} from "./inventory.ts";

const product = {
  id: "a",
  title: "Помидоры",
  article: "00001",
  supplyId: "00351",
  units: "кг",
  remains: "12",
  price: "120",
  totalPrice: "1440",
  shelfLife: "30.10.2026",
  status: "normal",
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

test("inventory applies by row id, recalculates value and keeps zero quantity", () => {
  const original = entries.map((entry) => entry.product);
  const result = applyInventoryToProducts(original, entries);
  assert.equal(result.length, 3);
  assert.equal(result[0].remains, "1.25");
  assert.equal(Number(result[0].totalPrice), 150);
  assert.equal(result[1].remains, "0");
  assert.equal(result[2], original[3]);
  assert.equal(original[0].remains, "12");
});

test("unrelated positions are preserved", () => {
  const extra = { ...product, id: "extra" };
  assert.equal(
    applyInventoryToProducts([product, extra], [entries[0]])[1],
    extra,
  );
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
  assert.throws(() =>
    applyInventoryToProducts(
      [product],
      [{ product, actual: "", remove: false }],
    ),
  );
});
