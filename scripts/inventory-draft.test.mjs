import { test } from "node:test";
import assert from "node:assert/strict";
import {
  inventoryDraftReducer,
  inventoryDraftActions,
} from "../src/features/inventory/model/inventorySlice.ts";

const product = Object.freeze({
  id: 27, supplyId: 8, productId: 3, Quantity: 12, price: 100, totalPrice: 1200,
  balance: Object.freeze({ availableQuantity: 12, reservedQuantity: 4 }),
  product: { id: 3, name: "Помидоры", unit: { id: 2, name: "Килограмм", shortName: "кг" } },
  expiresAt: "2026-10-30T12:00:00Z", status: "ACTIVE",
});

test("inventory starts without data, accepts loaded stock and preserves edits on refetch", () => {
  let draft = inventoryDraftReducer(undefined, { type: "init" });
  assert.equal(draft.initialized, false);
  assert.deepEqual(draft.entries, []);
  draft = inventoryDraftReducer(
    draft,
    inventoryDraftActions.initialize([product]),
  );
  assert.equal(draft.entries[0].actual, 12);
  assert.deepEqual(draft.entries[0].product, product);
  draft = inventoryDraftReducer(
    draft,
    inventoryDraftActions.updateEntry({
      id: product.id,
      patch: { actual: 2.5, remove: true },
    }),
  );
  draft = inventoryDraftReducer(
    draft,
    inventoryDraftActions.initialize([{ ...product, Quantity: 15 }]),
  );
  assert.equal(draft.entries[0].actual, 2.5);
  assert.equal(draft.entries[0].remove, true);
  assert.equal(product.balance.availableQuantity, 12);
  assert.equal(product.Quantity, 12);
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
    inventoryDraftActions.initialize([{ ...product, Quantity: 15 }]),
  );
  assert.equal(draft.entries[0].actual, 15);
});


test("only a completed inventory exposes a report; starting another inventory clears it", () => {
  assert.equal(typeof inventoryDraftActions.complete, "function", "Successful server save must record the completed report");
  const report = { date: "2026-10-12", completedAt: "2026-10-12 10:00:00", completedBy: "User", entries: [], counts: { checked: 0, updated: 0, deleted: 0, unchanged: 0 } };
  let draft = inventoryDraftReducer(undefined, { type: "init" });
  assert.equal(draft.report, null);
  draft = inventoryDraftReducer(draft, inventoryDraftActions.setReady(true));
  draft = inventoryDraftReducer(draft, inventoryDraftActions.complete(report));
  assert.deepEqual(draft.report, report);
  assert.equal(draft.ready, false);
  draft = inventoryDraftReducer(draft, inventoryDraftActions.reset("2026-10-13"));
  assert.equal(draft.report, null);
});
