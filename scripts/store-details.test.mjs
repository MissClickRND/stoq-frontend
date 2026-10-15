import { test } from "node:test";
import assert from "node:assert/strict";
import * as stock from "../src/entities/store/lib/stock.ts";
import { storeStatuses } from "../src/entities/store/model/config.ts";

const selected = { id: 59, productId: 1, Quantity: 10, availableQuantity: "0.5" };

test("available balance takes precedence over original quantity, including zero", () => {
  assert.equal(stock.getStoreQuantity(selected), 0.5);
  assert.equal(stock.getStoreQuantity({ ...selected, availableQuantity: 0 }), 0);
  assert.equal(stock.getStoreQuantity({ Quantity: 2.75 }), 2.75);
});

test("product batches include current detail once and exclude other products; total uses available balances", () => {
  const batches = [
    { ...selected, availableQuantity: 10 },
    { id: 60, productId: 1, Quantity: 5, availableQuantity: "1.25" },
    { id: 61, productId: 2, Quantity: 99, availableQuantity: 99 },
    { id: 62, productId: 1, Quantity: 12, availableQuantity: 0 },
  ];
  const original = structuredClone(batches);
  const matching = stock.getProductBatches(batches, selected);
  assert.deepEqual(matching.map(item => item.id), [59, 60, 62]);
  assert.equal(stock.getTotalStoreQuantity(matching), 1.75);
  assert.deepEqual(batches, original);
  assert.deepEqual(stock.getProductBatches([], selected), [selected]);
});

test("all four server statuses have distinct labels and shelf-life colors", () => {
  assert.deepEqual(Object.keys(storeStatuses).sort(), ["ACTIVE", "DEPLETED", "EXPIRED", "RUNNINGOUT"]);
  assert.equal(storeStatuses.ACTIVE.color, "green");
  assert.equal(storeStatuses.DEPLETED.color, "gray");
  assert.equal(storeStatuses.EXPIRED.color, "red");
  assert.equal(storeStatuses.RUNNINGOUT.color, "orange");
  assert.equal(storeStatuses.RUNNINGOUT.label, "Скоро испортится");
});
