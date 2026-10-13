import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { configureStore } from "@reduxjs/toolkit";

const root = path.resolve(import.meta.dirname, "..");

// Resolve the application's Vite aliases for Node without changing its source.
registerHooks({
  resolve(specifier, context, nextResolve) {
    let target;
    if (specifier.startsWith("@/")) {
      target = path.join(root, "src", specifier.slice(2));
    } else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
      target = fileURLToPath(new URL(specifier, context.parentURL));
    }
    if (target && !path.extname(target)) {
      const file = [`${target}.ts`, path.join(target, "index.ts")]
        .find((candidate) => fs.existsSync(candidate));
      if (file) return nextResolve(pathToFileURL(file).href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    const loaded = nextLoad(url, context);
    if (url.endsWith("/shared/api/baseQuery.ts") || url.endsWith("/entities/store/api/store.ts")) {
      return { ...loaded, source: String(loaded.source)
        .replace("import.meta.env.VITE_API_URL", "undefined")
        .replace("import { IInventoryStoreRequest, IStoreProduct }", "import type { IInventoryStoreRequest, IStoreProduct }") };
    }
    if (url.endsWith("/entities/inventory/index.ts")) {
      return { ...loaded, source: String(loaded.source).replace(/^export \{ InventoryChangesTable \}.*$/m, "") };
    }
    return loaded;
  },
});

const { storeApi } = await import("../src/entities/store/api/store.ts");
const { toInventoryStoreRequest } = await import("../src/entities/inventory/lib/inventory.ts");

const batch = {
  id: 27, supplyId: 8, productId: 3, Quantity: 12.5, price: 100, totalPrice: 1250, status: "ACTIVE",
  product: { id: 3, name: "Помидоры", unit: { id: 2, name: "Килограмм", shortName: "кг" } },
};
const createTestStore = () => configureStore({
  reducer: { [storeApi.reducerPath]: storeApi.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(storeApi.middleware),
});

test("store endpoints read warehouse and a batch and PUT exact changed quantities; list refreshes", async (t) => {
  const requests = [];
  let current = { ...batch };
  t.mock.method(globalThis, "fetch", async (request) => {
    const url = new URL(request.url);
    const body = request.method === "PUT" ? await request.json() : undefined;
    requests.push({ method: request.method, path: url.pathname, search: url.searchParams.get("search"), body });
    if (body) current = { ...current, Quantity: body.items[0].quantity, totalPrice: body.items[0].quantity * current.price };
    return new Response(JSON.stringify([current]), {
      headers: { "Content-Type": "application/json" },
    });
  });
  const store = createTestStore();
  const listing = store.dispatch(storeApi.endpoints.getStore.initiate({ search: "Помидоры" }));
  t.after(() => { listing.unsubscribe(); store.dispatch(storeApi.util.resetApiState()); });
  assert.deepEqual(await listing.unwrap(), [batch]);
  assert.equal(requests[0].search, "Помидоры");
  const detail = store.dispatch(storeApi.endpoints.getStoreProductById.initiate({ id: 3 }));
  t.after(() => detail.unsubscribe());
  assert.deepEqual(await detail.unwrap(), [batch]);
  assert.equal(requests.at(-1).path, "/inventory/3");
  const request = toInventoryStoreRequest([{ product: batch, actual: "2.75", remove: false }]);
  const saved = await store.dispatch(storeApi.endpoints.inventoryStore.initiate(request)).unwrap();
  assert.equal(saved[0].Quantity, 2.75);
  assert.deepEqual(requests.find((request) => request.method === "PUT"), {
    method: "PUT", path: "/inventory", search: null,
    body: { items: [{ batchId: 27, quantity: 2.75 }] },
  });
  await Promise.all(store.dispatch(storeApi.util.getRunningQueriesThunk()));
  assert.equal(storeApi.endpoints.getStore.select({ search: "Помидоры" })(store.getState()).data[0].Quantity, 2.75);
  // The UI also invalidates detail tags after a successful save.
  store.dispatch(storeApi.util.invalidateTags([{ type: "Store", id: 3 }]));
  await Promise.all(store.dispatch(storeApi.util.getRunningQueriesThunk()));
  assert.equal(storeApi.endpoints.getStoreProductById.select({ id: 3 })(store.getState()).data[0].Quantity, 2.75);
  const writeOff = toInventoryStoreRequest([{ product: current, actual: "", remove: true }]);
  await store.dispatch(storeApi.endpoints.inventoryStore.initiate(writeOff)).unwrap();
  assert.deepEqual(requests.filter((request) => request.method === "PUT").at(-1).body, { items: [{ batchId: 27, quantity: 0 }] });
});

test("server rejects inventory; submitted quantities are preserved and retry can succeed", async (t) => {
  let fail = true;
  t.mock.method(globalThis, "fetch", async () => new Response(
    JSON.stringify(fail ? { message: "Не удалось сохранить" } : [{ ...batch, Quantity: 2 }]),
    { status: fail ? 500 : 200, headers: { "Content-Type": "application/json" } },
  ));
  const store = createTestStore();
  t.after(() => store.dispatch(storeApi.util.resetApiState()));
  const entries = [{ product: batch, actual: 2, remove: false }];
  const original = structuredClone(entries);
  const request = toInventoryStoreRequest(entries);
  await assert.rejects(store.dispatch(storeApi.endpoints.inventoryStore.initiate(request)).unwrap(), { status: 500 });
  assert.deepEqual(entries, original);
  fail = false;
  assert.equal((await store.dispatch(storeApi.endpoints.inventoryStore.initiate(request)).unwrap())[0].Quantity, 2);
});


test("valid inventory always calls the mutation even without a prepared flag and never reports failed saves", async () => {
  const file = new URL("../src/features/inventory/model/saveInventory.ts", import.meta.url);
  assert.ok(fs.existsSync(file), "Inventory save must validate the draft rather than silently exit on ready=false");
  const { saveInventoryDraft } = await import(file.href);
  const draft = { ready: false, date: "2026-10-12", entries: [{ product: batch, actual: 4, remove: false }] };
  const requests = [];
  const report = await saveInventoryDraft(draft, "User", async request => {
    requests.push(request);
    return [{ ...batch, Quantity: 4 }];
  });
  assert.deepEqual(requests, [{ items: [{ batchId: 27, quantity: 4 }] }]);
  assert.equal(report.entries[0].actual, 4);
  assert.equal(report.completedBy, "User");
  assert.equal(report.counts.updated, 1);
  await assert.rejects(saveInventoryDraft(draft, "User", async () => { throw new Error("Server failure"); }), /Server failure/);
  let called = false;
  for (const invalid of [{ ...draft, date: null }, { ...draft, entries: [] }, { ...draft, entries: [{ product: batch, actual: "", remove: false }] }]) {
    await assert.rejects(saveInventoryDraft(invalid, "User", async () => { called = true; return []; }));
  }
  assert.equal(called, false);
});
