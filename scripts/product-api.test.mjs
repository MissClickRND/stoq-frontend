import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { configureStore } from "@reduxjs/toolkit";
import ts from "typescript";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MantineProvider } from "@mantine/core";

const root = path.resolve(import.meta.dirname, "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/shared/lib") specifier = "@/shared/lib/format";
    let target;
    if (specifier.startsWith("@/")) target = path.join(root, "src", specifier.slice(2));
    else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:"))
      target = fileURLToPath(new URL(specifier, context.parentURL));
    if (specifier.startsWith("@/") && target && path.extname(target) && fs.existsSync(target))
      return nextResolve(pathToFileURL(target).href, context);
    if (target && !path.extname(target)) {
      const file = [`${target}.ts`, path.join(target, "index.ts")].find(candidate => fs.existsSync(candidate));
      if (file) return nextResolve(pathToFileURL(file).href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith(".module.css"))
      return { format: "module", shortCircuit: true, source: "export default {};" };
    if (url.endsWith(".tsx"))
      return { format: "module", shortCircuit: true, source: ts.transpileModule(fs.readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText };
    const loaded = nextLoad(url, context);
    if (url.endsWith("/shared/api/baseQuery.ts"))
      return { ...loaded, source: String(loaded.source).replace("import.meta.env.VITE_API_URL", "undefined") };
    return loaded;
  },
});

const { productApi } = await import("../src/entities/product/api/product.ts");
const { toCreateSupplyRequest } = await import("../src/entities/supply/lib/create-request.ts");
const unit = { id: 1, name: "Килограмм", shortName: "кг" };
const dto = { id: 42, name: "Помидоры", unit };
const createStore = () => configureStore({
  reducer: { [productApi.reducerPath]: productApi.reducer },
  middleware: defaults => defaults().concat(productApi.middleware),
});

for (const [endpoint, arg, array] of [
  ["getProducts", { search: "Помидоры" }, true],
  ["getProductById", { id: 42 }, false],
  ["createProduct", { name: "Помидоры", unitId: 1 }, false],
  ["createManyProduct", [{ name: "Помидоры", unitId: 1 }], true],
]) {
  test(`${endpoint} derives unitId from nested unit when backend omits it`, async t => {
    t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify(array ? [dto] : dto), {
      headers: { "Content-Type": "application/json" },
    }));
    const store = createStore();
    const operation = store.dispatch(productApi.endpoints[endpoint].initiate(arg));
    t.after(() => { operation.unsubscribe?.(); store.dispatch(productApi.util.resetApiState()); });
    const result = await operation.unwrap();
    const product = array ? result[0] : result;
    assert.equal(product.unitId, 1);
    assert.deepEqual(product.unit, unit);
    const request = toCreateSupplyRequest({
      supplyNumber: "П-42", receivedAt: "2026-10-13T08:00:00.000Z",
      items: [{ id: "draft-row", product, unitId: product.unitId, quantity: 2,
        expiresAt: "2026-10-20T08:00:00.000Z", price: 0, pricingMode: "unit" }],
    });
    assert.equal(request.items[0].productId, 42);
    assert.equal(request.items[0].quantity, 2);
  });
}

test("preserves unitId when the backend already returns it", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify([{ ...dto, unitId: 1 }]), {
    headers: { "Content-Type": "application/json" },
  }));
  const store = createStore();
  const operation = store.dispatch(productApi.endpoints.getProducts.initiate({ search: "" }));
  t.after(() => { operation.unsubscribe(); store.dispatch(productApi.util.resetApiState()); });
  assert.deepEqual(await operation.unwrap(), [{ ...dto, unitId: 1 }]);
});

test("adding a catalog product renders the real supply card without duplicate Mantine options", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify([dto]), {
    headers: { "Content-Type": "application/json" },
  }));
  const store = createStore();
  const operation = store.dispatch(productApi.endpoints.getProducts.initiate({ search: "" }));
  t.after(() => { operation.unsubscribe(); store.dispatch(productApi.util.resetApiState()); });
  const [product] = await operation.unwrap();
  const { SupplyProductCard } = await import("../src/pages/supply/ui/components/SupplyProductCard/SupplyProductCard.tsx");
  const html = renderToString(createElement(MantineProvider, { env: "test" }, createElement(SupplyProductCard, {
    item: { id: "draft-row", product, quantity: "", unitId: product.unitId, expiresAt: null, price: 0, pricingMode: "unit" },
    units: [unit], receivedAt: null, submitted: false, onChange() {}, onRemove() {}, onAddUnit() {},
  })));
  assert.match(html, /Помидоры/);
  assert.match(html, /value="кг"/);
});
