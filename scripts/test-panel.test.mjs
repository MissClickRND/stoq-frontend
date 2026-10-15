import { test } from "node:test";
import assert from "node:assert/strict";
import {
  seedRestaurant,
  createExternalSupply,
  createShortLifeSupply,
} from "../src/features/test-panel/model/workflows.ts";

test("short-life supply uses existing products, is received immediately and expires in 1 and 2 minutes", async () => {
  let sent;
  const result = await createShortLifeSupply(
    async (url, method = "GET", body) => {
      if (url === "/product?search=")
        return [
          { id: 4, name: "Мука пшеничная" },
          { id: 8, name: "Молоко" },
          { id: 12, name: "Моцарелла" },
        ];
      assert.equal(url, "/supplies");
      assert.equal(method, "POST");
      sent = body;
      return { id: 25 };
    },
    "short",
    new Date("2026-10-15T12:00:00Z"),
  );
  assert.equal(result.id, 25);
  assert.equal(sent.status, "RECEIVED");
  assert.deepEqual(
    sent.items.map((item) => item.productId),
    [8, 12],
  );
  assert.deepEqual(
    sent.items.map((item) => item.expiresAt),
    ["2026-10-15T12:01:00.000Z", "2026-10-15T12:02:00.000Z"],
  );
  assert.ok(
    sent.items.every((item) => item.quantity > 0 && item.totalPrice >= 0),
  );
});

test("short-life supply supports a small arbitrary catalog and rejects an empty one", async () => {
  let items;
  await createShortLifeSupply(async (url, _method, body) => {
    if (url === "/product?search=") return [{ id: 33, name: "Яблоко" }];
    items = body.items;
    return { id: 26 };
  }, "fallback");
  assert.equal(items.length, 1);
  assert.equal(items[0].productId, 33);
  await assert.rejects(
    createShortLifeSupply(async () => [], "empty"),
    /Сначала заполните/,
  );
});

test("seed uses batch endpoints and real returned IDs to link recipes and the received supply", async () => {
  const calls = [];
  let catalog;
  const request = async (url, method = "GET", body) => {
    calls.push({ url, method, body });
    if (url === "/product/units")
      return [
        { id: 7, shortName: "кг" },
        { id: 9, shortName: "л" },
        { id: 15, shortName: "шт." },
      ];
    if (url === "/product?search=" || url === "/dishes?search=") return [];
    if (url === "/product/few")
      return (catalog = body
        .map((item, i) => ({ ...item, id: 100 + i * 7 }))
        .reverse());
    if (url === "/supplies") return { id: 57 };
    if (url === "/dishes/batch") return body.map((_, i) => ({ id: 300 + i }));
    throw new Error(url);
  };
  const result = await seedRestaurant(
    request,
    "abc",
    new Date("2026-10-15T12:00:00Z"),
  );
  assert.deepEqual(result, { products: 6, dishes: 3, supplyId: 57 });
  assert.deepEqual(
    calls
      .find((call) => call.url === "/product/few")
      .body.map((item) => item.name),
    [
      "Мука пшеничная",
      "Молоко",
      "Яйцо куриное",
      "Томаты",
      "Моцарелла",
      "Масло растительное",
    ],
  );
  const supply = calls.find((call) => call.url === "/supplies").body;
  assert.equal(supply.status, "RECEIVED");
  assert.deepEqual(
    supply.items.slice(0, 6).map((item) => item.productId),
    [100, 107, 114, 121, 128, 135],
  );
  assert.equal(supply.items.length, 8);
  const remainingMinutes = supply.items.map(
    (item) =>
      (Date.parse(item.expiresAt) - Date.parse(supply.receivedAt)) / 60000,
  );
  assert.ok(remainingMinutes.includes(2));
  assert.ok(remainingMinutes.includes(5));
  assert.ok(remainingMinutes.includes(3 * 24 * 60));
  assert.ok(remainingMinutes.includes(365 * 24 * 60));
  assert.equal(new Set(supply.items.map((item) => item.productId)).size, 6);
  assert.deepEqual(
    calls.at(-1).body.map((dish) => dish.name),
    ["Омлет с томатами", "Капрезе", "Блины"],
  );
  for (const dish of calls.at(-1).body) {
    const photo = new URL(dish.imageURL);
    assert.equal(photo.protocol, "https:");
    assert.equal(photo.hostname, "avatars.mds.yandex.net");
  }
  for (const dish of calls.at(-1).body)
    for (const ingredient of dish.recipeItems)
      assert.ok(catalog.some((product) => product.id === ingredient.productId));
  assert.deepEqual(
    calls.at(-1).body[0].recipeItems.map((item) => item.productId),
    [114, 107, 121],
  );
});

test("failed catalog creation does not create supplies or dishes", async () => {
  const paths = [];
  await assert.rejects(
    seedRestaurant(async (url) => {
      paths.push(url);
      if (url === "/product/units")
        return [
          { id: 1, shortName: "кг" },
          { id: 2, shortName: "л" },
          { id: 3, shortName: "шт." },
        ];
      if (url === "/product?search=" || url === "/dishes?search=") return [];
      throw new Error("Catalog offline");
    }, "abc"),
    /Catalog offline/,
  );
  assert.ok(paths.includes("/product/few"));
  assert.ok(!paths.includes("/supplies") && !paths.includes("/dishes/batch"));
});

test("repeated filling reuses named catalog entries and only adds new stock batches", async () => {
  let catalog = [];
  let dishes = [];
  const calls = [];
  const request = async (url, method = "GET", body) => {
    calls.push({ url, method, body });
    if (url === "/product/units")
      return [
        { id: 1, shortName: "кг" },
        { id: 2, shortName: "л" },
        { id: 3, shortName: "шт." },
      ];
    if (url === "/product?search=") return catalog;
    if (url === "/dishes?search=") return dishes;
    if (url === "/product/few")
      return (catalog = body.map((product, i) => ({ ...product, id: i + 10 })));
    if (url === "/dishes/batch")
      return (dishes = body.map((dish, i) => ({ ...dish, id: i + 20 })));
    if (url === "/supplies") return { id: 90 };
    throw new Error(url);
  };
  await seedRestaurant(request, "first");
  const second = await seedRestaurant(request, "second");
  assert.deepEqual(second, { products: 0, dishes: 0, supplyId: 90 });
  assert.equal(calls.filter((call) => call.url === "/product/few").length, 1);
  assert.equal(calls.filter((call) => call.url === "/dishes/batch").length, 1);
  assert.equal(calls.filter((call) => call.url === "/supplies").length, 2);
});

test("filling rejects incompatible existing units before writing catalog or stock", async () => {
  await assert.rejects(
    seedRestaurant(async (url, method = "GET") => {
      assert.equal(method, "GET");
      if (url === "/product/units")
        return [
          { id: 1, shortName: "кг" },
          { id: 2, shortName: "л" },
          { id: 3, shortName: "шт." },
        ];
      if (url === "/product?search=")
        return [
          { id: 4, name: "Мука пшеничная", unit: { id: 5, shortName: "г" } },
        ];
      if (url === "/dishes?search=") return [];
      throw new Error(url);
    }, "abc"),
    /другая единица измерения/,
  );
});

test("external import uses existing catalog IDs, creates at most three lines and never stocks in-transit goods", async () => {
  let sent;
  const result = await createExternalSupply(async (url, method, body) => {
    if (url.startsWith("/product?"))
      return [{ id: 99 }, { id: 102 }, { id: 500 }, { id: 501 }];
    assert.equal(url, "/supplies");
    assert.equal(method, "POST");
    sent = body;
    return { id: 8 };
  }, "abc");
  assert.equal(result.id, 8);
  assert.equal(sent.status, "IN_TRANSIT");
  assert.deepEqual(
    sent.items.map((item) => item.productId),
    [99, 102, 500],
  );
  await assert.rejects(
    createExternalSupply(async () => [], "abc"),
    /Сначала заполните/,
  );
});
