import { test } from "node:test";
import assert from "node:assert/strict";
import {
  inventoryDraftReducer,
  inventoryDraftActions,
} from "../src/features/inventory/model/inventorySlice.ts";

const product = Object.freeze({
  id: "stock-1",
  title: "Помидоры",
  article: "00001",
  units: "кг",
  remains: "12",
  price: "120",
  totalPrice: "1440",
  shelfLife: "30.10.2026",
  status: "normal",
  supplyId: "supply-1",
});

test("inventory starts without data, accepts loaded stock and preserves edits on refetch", () => {
  let draft = inventoryDraftReducer(undefined, { type: "init" });
  assert.equal(draft.initialized, false);
  assert.deepEqual(draft.entries, []);
  draft = inventoryDraftReducer(
    draft,
    inventoryDraftActions.initialize([product]),
  );
  draft = inventoryDraftReducer(
    draft,
    inventoryDraftActions.updateEntry({
      id: product.id,
      patch: { actual: 2.5, remove: true },
    }),
  );
  draft = inventoryDraftReducer(
    draft,
    inventoryDraftActions.initialize([{ ...product, remains: "15" }]),
  );
  assert.equal(draft.entries[0].actual, 2.5);
  assert.equal(draft.entries[0].remove, true);
  assert.equal(product.remains, "12");
  assert.equal(product.totalPrice, "1440");
});

test("a new inventory resets the draft and uses fresh loaded quantities", () => {
  let draft = inventoryDraftReducer(
    undefined,
    inventoryDraftActions.initialize([product]),
  );
  draft = inventoryDraftReducer(draft, inventoryDraftActions.setReady(true));
  draft = inventoryDraftReducer(
    draft,
    inventoryDraftActions.reset("2026-10-12"),
  );
  assert.equal(draft.date, "2026-10-12");
  assert.equal(draft.ready, false);
  assert.equal(draft.initialized, false);
  assert.deepEqual(draft.entries, []);
  draft = inventoryDraftReducer(
    draft,
    inventoryDraftActions.initialize([{ ...product, remains: "15" }]),
  );
  assert.equal(draft.entries[0].actual, 15);
});
