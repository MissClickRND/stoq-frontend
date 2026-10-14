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
    if (url.endsWith("/shared/api/baseQuery.ts")) {
      return {
        ...loaded,
        source: String(loaded.source).replace("import.meta.env.VITE_API_URL", "undefined"),
      };
    }
    return loaded;
  },
});

const { dishApi } = await import("../src/entities/dish/api/dish.ts");
const { productApi } = await import("../src/entities/product/api/product.ts");
const { toDish, toCreateDishRequest } = await import("../src/entities/dish/lib/adapters.ts");

test("server products supply recipe IDs; creation sends Swagger JSON and refreshes dishes", async (t) => {
  const requests = [];
  const product = {
    id: 1, name: "Мука пшеничная", unitId: 1,
    unit: { id: 1, name: "Грамм", shortName: "г" },
  };
  const dish = {
    id: 27, name: "Омлет", description: "Описание", salePrice: 520,
    imageURL: "https://example.com/omelet.jpg",
    recipeItems: [{ id: 84, dishId: 27, productId: 1, quantity: 2, product }],
  };
  let saved = false;
  t.mock.method(globalThis, "fetch", async (request) => {
    const url = new URL(request.url);
    const body = request.method === "POST" ? await request.json() : undefined;
    requests.push({ method: request.method, path: url.pathname, search: url.searchParams.get("search"), body });
    const data = url.pathname === "/product"
      ? [product]
      : request.method === "POST"
        ? (saved = true, dish)
        : url.pathname === "/dishes/27" ? dish : saved ? [dish] : [];
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  });
  const store = configureStore({
    reducer: { [dishApi.reducerPath]: dishApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(dishApi.middleware),
  });
  const listing = store.dispatch(dishApi.endpoints.getDishes.initiate({ search: "" }));
  t.after(() => { listing.unsubscribe(); store.dispatch(dishApi.util.resetApiState()); });
  assert.deepEqual(await listing.unwrap(), []);
  const products = await store.dispatch(productApi.endpoints.getProducts.initiate({ search: "" })).unwrap();
  const draft = { ...toDish(dish), ingredients: [{ ...toDish(dish).ingredients[0], id: String(products[0].id) }] };
  const result = await store.dispatch(dishApi.endpoints.createDish.initiate(toCreateDishRequest(draft))).unwrap();
  assert.equal(result.id, 27);
  assert.deepEqual(requests.find((request) => request.method === "POST"), {
    method: "POST", path: "/dishes", search: null,
    body: {
      name: "Омлет", description: "Описание", imageURL: "https://example.com/omelet.jpg",
      salePrice: 520, recipeItems: [{ productId: 1, quantity: 2 }],
    },
  });
  await Promise.all(store.dispatch(dishApi.util.getRunningQueriesThunk()));
  const updated = dishApi.endpoints.getDishes.select({ search: "" })(store.getState());
  assert.deepEqual(updated.data, [dish]);
  assert.equal(requests.filter((request) => request.path === "/dishes" && request.method === "GET").length, 2);
  const detail = await store.dispatch(dishApi.endpoints.getDishById.initiate({ id: 27 })).unwrap();
  assert.deepEqual(detail, dish);
  assert.deepEqual(requests.at(-1), { method: "GET", path: "/dishes/27", search: null, body: undefined });
});

test("a failed create request rejects without manufacturing a saved dish", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    JSON.stringify({ message: "Не удалось сохранить блюдо" }),
    { status: 500, headers: { "Content-Type": "application/json" } },
  ));
  const store = configureStore({
    reducer: { [dishApi.reducerPath]: dishApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(dishApi.middleware),
  });
  t.after(() => store.dispatch(dishApi.util.resetApiState()));
  const draft = { name: "Омлет", description: "Описание", price: 520, stopped: false, ingredients: [] };
  await assert.rejects(store.dispatch(dishApi.endpoints.createDish.initiate(toCreateDishRequest(draft))).unwrap(), { status: 500 });
});

test("catalog and stop-list searches use separate endpoints and preserve each server response", async (t) => {
  const requests = [];
  const dish = {
    id: 27, name: "Омлет", category: "Завтраки", description: "Сырный",
    salePrice: null, costPrice: null, availablePortions: 3, recipeItems: [],
  };
  const stopped = {
    dishId: 38, dishName: "Сырники", salePrice: 0, status: "STOP_LIST", maxPortions: 0, priority: 0,
    reasons: [
      { status: "INSUFFICIENT_STOCK", name: "Творог" },
      { status: "EXPIRED_INGREDIENT", name: "Творог" },
    ],
  };
  t.mock.method(globalThis, "fetch", async (request) => {
    const url = new URL(request.url);
    requests.push({ method: request.method, path: url.pathname, search: url.searchParams.get("search") });
    assert.ok(["/dishes", "/recommendations"].includes(url.pathname));
    const data = url.searchParams.get("search") === "не найдено" ? []
      : url.pathname === "/dishes" ? [dish] : [stopped];
    return Response.json(data);
  });
  const store = configureStore({
    reducer: { [dishApi.reducerPath]: dishApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(dishApi.middleware),
  });
  t.after(() => store.dispatch(dishApi.util.resetApiState()));
  const allArgs = { search: "Омлет & сыр" };
  const stopArgs = { search: "Сырники" };
  const catalog = store.dispatch(dishApi.endpoints.getDishes.initiate(allArgs));
  const stopList = store.dispatch(dishApi.endpoints.getStopListDishes.initiate(stopArgs));
  t.after(() => { catalog.unsubscribe(); stopList.unsubscribe(); });
  assert.deepEqual(await catalog.unwrap(), [dish]);
  assert.deepEqual(await stopList.unwrap(), [stopped]);
  assert.deepEqual(requests, [
    { method: "GET", path: "/dishes", search: allArgs.search },
    { method: "GET", path: "/recommendations", search: stopArgs.search },
  ]);
  const empty = store.dispatch(dishApi.endpoints.getStopListDishes.initiate({ search: "не найдено" }));
  t.after(() => empty.unsubscribe());
  assert.deepEqual(await empty.unwrap(), []);
  assert.deepEqual(dishApi.endpoints.getDishes.select(allArgs)(store.getState()).data, [dish]);
  assert.deepEqual(dishApi.endpoints.getStopListDishes.select(stopArgs)(store.getState()).data, [stopped]);
});

test("stop-list errors reject and retry through the stop-list endpoint", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (request) => {
    assert.equal(new URL(request.url).pathname, "/recommendations");
    calls++;
    return calls === 1 ? Response.json({ message: "Стоп-лист недоступен" }, { status: 503 }) : Response.json([]);
  });
  const store = configureStore({
    reducer: { [dishApi.reducerPath]: dishApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(dishApi.middleware),
  });
  const listing = store.dispatch(dishApi.endpoints.getStopListDishes.initiate({ search: "" }));
  t.after(() => { listing.unsubscribe(); store.dispatch(dishApi.util.resetApiState()); });
  await assert.rejects(listing.unwrap(), { status: 503 });
  assert.deepEqual(await listing.refetch().unwrap(), []);
  assert.equal(calls, 2);
});

test("stop-list refreshes after dish creation, deletion and warehouse changes", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (request) => {
    if (new URL(request.url).pathname === "/recommendations") calls++;
    return Response.json(request.method === "GET" ? [] : { id: 27 });
  });
  const store = configureStore({
    reducer: { [dishApi.reducerPath]: dishApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(dishApi.middleware),
  });
  const listing = store.dispatch(dishApi.endpoints.getStopListDishes.initiate({ search: "" }));
  t.after(() => { listing.unsubscribe(); store.dispatch(dishApi.util.resetApiState()); });
  await listing.unwrap();
  assert.equal(calls, 1);
  await store.dispatch(dishApi.endpoints.createDish.initiate({
    name: "Омлет", description: "", salePrice: 200, recipeItems: [],
  })).unwrap();
  await Promise.all(store.dispatch(dishApi.util.getRunningQueriesThunk()));
  assert.equal(calls, 2);
  await store.dispatch(dishApi.endpoints.deleteDish.initiate({ id: 27 })).unwrap();
  await Promise.all(store.dispatch(dishApi.util.getRunningQueriesThunk()));
  assert.equal(calls, 3);
  store.dispatch(dishApi.util.invalidateTags(["Store"]));
  await Promise.all(store.dispatch(dishApi.util.getRunningQueriesThunk()));
  assert.equal(calls, 4);
});
