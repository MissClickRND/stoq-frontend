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
    if (specifier === "@/shared/lib") specifier = "@/shared/lib/format";
    let target;
    if (specifier.startsWith("@/")) {
      target = path.join(root, "src", specifier.slice(2));
    } else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
      target = fileURLToPath(new URL(specifier, context.parentURL));
    }
    if (specifier.startsWith("@/") && target && path.extname(target) && fs.existsSync(target))
      return nextResolve(pathToFileURL(target).href, context);
    if (target && !path.extname(target)) {
      const file = [`${target}.ts`, path.join(target, "index.ts")]
        .find((candidate) => fs.existsSync(candidate));
      if (file) return nextResolve(pathToFileURL(file).href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    const loaded = nextLoad(url, context);
    if (url.endsWith("/shared/api/baseQuery.ts") || url.endsWith("/entities/supply/api/supply.ts")) {
      return { ...loaded, source: String(loaded.source)
        .replace("import.meta.env.VITE_API_URL", "undefined")
        .replace("import { ICreateSupplyRequest, ISupply }", "import type { ICreateSupplyRequest, ISupply }") };
    }
    if (url.endsWith("/entities/inventory/index.ts")) {
      return { ...loaded, source: String(loaded.source).replace(/^export \{ InventoryChangesTable \}.*$/m, "") };
    }
    return loaded;
  },
});

const { suppliesApi } = await import("../src/entities/supply/api/supply.ts");
const product = { id: 42, name: "Молоко", unitId: 7, unit: { id: 7, name: "Литр", shortName: "л" } };
const supply = { id: 48, supplyNumber: "П-2026-0042", receivedAt: "2026-10-12T08:30:00.000Z", acceptedBy: "Иван", items: [{ id: 3, product, quantity: 1.25, expiresAt: "2026-10-20T15:45:00.000Z" }] };
const createStore = () => configureStore({
  reducer: { [suppliesApi.reducerPath]: suppliesApi.reducer },
  middleware: defaults => defaults().concat(suppliesApi.middleware),
});

test("supply form sends only contract fields, serializes Date expiry and reads created supply by numeric ID", async t => {
  const file = new URL("../src/entities/supply/lib/create-request.ts", import.meta.url);
  assert.ok(fs.existsSync(file), "The supply form must build ICreateSupplyRequest");
  const { toCreateSupplyRequest } = await import(file.href);
  const requests = [];
  let created = false;
  t.mock.method(globalThis, "fetch", async request => {
    const url = new URL(request.url);
    const body = request.method === "POST" ? await request.json() : undefined;
    requests.push({ method: request.method, path: url.pathname, search: url.searchParams.get("search"), body });
    if (body) created = true;
    return new Response(JSON.stringify(url.pathname === "/supplies/48" || body ? supply : created ? [supply] : []), { headers: { "Content-Type": "application/json" } });
  });
  const store = createStore();
  const listing = store.dispatch(suppliesApi.endpoints.getSupplies.initiate({ search: "П-2026" }));
  t.after(() => { listing.unsubscribe(); store.dispatch(suppliesApi.util.resetApiState()); });
  assert.deepEqual(await listing.unwrap(), []);
  assert.equal(requests[0].search, "П-2026");
  const draft = { supplyNumber: "  П-2026-0042  ", receivedAt: "2026-10-12T08:30:00.000Z", items: [{ id: "local-id", product, unitId: 7, quantity: "1.25", expiresAt: "2026-10-20T15:45:00.000Z", price: 0, pricingMode: "unit" }] };
  const original = structuredClone(draft);
  const payload = toCreateSupplyRequest(draft);
  assert.ok(payload.items[0].expiresAt instanceof Date);
  assert.equal((await store.dispatch(suppliesApi.endpoints.createSupply.initiate(payload)).unwrap()).id, 48);
  assert.deepEqual(requests.find(item => item.method === "POST"), { method: "POST", path: "/supplies", search: null, body: { supplyNumber: "П-2026-0042", receivedAt: "2026-10-12T08:30:00.000Z", items: [{ productId: 42, quantity: 1.25, expiresAt: "2026-10-20T15:45:00.000Z" }] } });
  assert.deepEqual(draft, original);
  await Promise.all(store.dispatch(suppliesApi.util.getRunningQueriesThunk()));
  assert.deepEqual(suppliesApi.endpoints.getSupplies.select({ search: "П-2026" })(store.getState()).data, [supply]);
  assert.deepEqual(await store.dispatch(suppliesApi.endpoints.getSupplyById.initiate({ id: 48 })).unwrap(), supply);
  for (const invalid of [{ ...draft, supplyNumber: " " }, { ...draft, receivedAt: null }, { ...draft, items: [] }, { ...draft, items: [{ ...draft.items[0], quantity: "" }] }, { ...draft, items: [{ ...draft.items[0], expiresAt: "invalid" }] }])
    assert.throws(() => toCreateSupplyRequest(invalid));
});

test("failed supply creation rejects and retry can succeed with the same draft", async t => {
  let fail = true;
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify(fail ? { message: "Ошибка поставки" } : supply), { status: fail ? 500 : 200, headers: { "Content-Type": "application/json" } }));
  const store = createStore();
  t.after(() => store.dispatch(suppliesApi.util.resetApiState()));
  const payload = { supplyNumber: supply.supplyNumber, receivedAt: supply.receivedAt, items: [{ productId: 42, quantity: 1.25, expiresAt: new Date(supply.items[0].expiresAt) }] };
  await assert.rejects(store.dispatch(suppliesApi.endpoints.createSupply.initiate(payload)).unwrap(), { status: 500 });
  fail = false;
  assert.equal((await store.dispatch(suppliesApi.endpoints.createSupply.initiate(payload)).unwrap()).id, 48);
});
