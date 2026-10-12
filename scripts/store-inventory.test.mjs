import { test } from "node:test";
import assert from "node:assert/strict";
import * as inventory from "../src/entities/inventory/lib/inventory.ts";
import { getInventoryReportData } from "../src/entities/inventory/lib/inventory-report.ts";

const product = {
  id: 27, supplyId: 8, productId: 3, initialQuantity: 100,
  balance: { availableQuantity: 12.5, reservedQuantity: 4 }, status: "ACTIVE",
  expiresAt: "2026-10-20T15:30:00Z",
  product: { id: 3, name: "Помидоры", unit: { id: 2, name: "Килограмм", shortName: "кг" } },
};

test("inventory uses raw server batches and compares with available quantities instead of supplied quantities", () => {
  const entries = [
    { product, actual: "2.75", remove: false },
    { product: { ...product, id: 28 }, actual: "", remove: true },
    { product: { ...product, id: 29 }, actual: 12.5, remove: false },
    { product: { ...product, id: 30 }, actual: 0, remove: false },
  ];
  const original = structuredClone(entries);
  assert.deepEqual(inventory.toInventoryStoreRequest(entries), {
    items: [{ batchId: 27, quantity: 2.75 }, { batchId: 28, quantity: 0 }, { batchId: 30, quantity: 0 }],
  });
  assert.deepEqual(entries, original);
  assert.deepEqual(inventory.toInventoryStoreRequest([entries[2]]), { items: [] });
  for (const actual of ["", " ", -1, NaN, Infinity, "abc"])
    assert.throws(() => inventory.toInventoryStoreRequest([{ product, actual, remove: false }]));
});

test("XLSX takes original quantity and product identity from IStoreProduct", () => {
  const entries = [{ product, actual: 4, remove: false }];
  const report = { date: "2026-10-12", completedAt: "2026-10-12 12:00:00", completedBy: "User", entries, counts: { checked: 1, updated: 1, deleted: 0, unchanged: 0 } };
  const row = getInventoryReportData(report).at(-1);
  assert.equal(row[0].value, "Помидоры");
  assert.equal(row[1].value, "00008");
  assert.equal(row[2].value, "00003");
  assert.equal(row[3].value, 12.5);
  assert.equal(row[4].value, 4);
  assert.equal(row[5].value, "кг");
});
