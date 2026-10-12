import { test } from "node:test";
import assert from "node:assert/strict";
import { toDish, toDishIngredient, toCreateDishRequest } from "./adapters.ts";
import { dishCost, matchesDish } from "./calculations.ts";

const product = {
  id: 23, name: "Продукт из API", unitId: 4,
  unit: { id: 4, name: "Грамм", shortName: "г", createdAt: "2026-10-12" },
  createdAt: "2026-10-12", updatedAt: "2026-10-12", isDeleted: false,
};
const source = {
  id: 57, name: "Блюдо из API", description: "Описание из API",
  salePrice: 0, imageURL: "/dish.png",
  recipeItems: [{ id: 99, dishId: 57, productId: 23, quantity: 0.75, product }],
};

test("API dish fields and recipe quantities are preserved without invented recommendations or sales", () => {
  const before = structuredClone(source);
  const dish = toDish(source);
  assert.equal(dish.id, "57");
  assert.equal(dish.name, source.name);
  assert.equal(dish.description, source.description);
  assert.equal(dish.price, 0);
  assert.equal(dish.imageUrl, "/dish.png");
  assert.equal(dish.ingredients[0].id, "23");
  assert.equal(dish.ingredients[0].name, product.name);
  assert.equal(dish.ingredients[0].unit, "г");
  assert.equal(dish.ingredients[0].quantity, 0.75);
  assert.ok(Number.isFinite(dishCost(dish)));
  assert.ok(matchesDish(dish, product.name));
  assert.equal(dish.recommendation, undefined);
  assert.deepEqual(dish.sales, []);
  assert.equal(dish.archived, false);
  assert.deepEqual(source, before);
  assert.deepEqual(toDish(source), dish);
});

test("missing API fields use fixed defaults without inventing recipe items", () => {
  const minimal = toDish({ id: 57, name: "Только название" });
  assert.equal(minimal.name, "Только название");
  assert.equal(minimal.description, "");
  assert.equal(minimal.price, 0);
  assert.deepEqual(minimal.ingredients, []);
  const empty = toDish({ ...source, description: "", imageURL: "", recipeItems: [] });
  assert.equal(empty.description, "");
  assert.equal(empty.imageUrl, "");
  assert.deepEqual(empty.ingredients, []);
});

test("product adapter preserves actual product IDs, names and units for recipe selection", () => {
  const ingredient = toDishIngredient(product);
  assert.equal(ingredient.id, "23");
  assert.equal(ingredient.name, product.name);
  assert.equal(ingredient.unit, "г");
});

test("a partially populated recipe preserves product ID and quantity with fixed labels", () => {
  const dish = toDish({
    ...source,
    recipeItems: [{ id: 99, dishId: 57, productId: 23, quantity: 0.75 }],
  });
  assert.equal(dish.ingredients[0].id, "23");
  assert.equal(dish.ingredients[0].quantity, 0.75);
  assert.equal(dish.ingredients[0].name, "Продукт #23");
  assert.equal(dish.ingredients[0].unit, "шт.");
  assert.ok(Number.isFinite(dishCost(dish)));
});

test("create payload uses numeric product IDs and excludes mock/UI fields and dish ID", () => {
  const draft = { ...toDish(source), price: 125, imageUrl: "/new.png" };
  assert.deepEqual(toCreateDishRequest(draft), {
    name: source.name, description: source.description, salePrice: 125,
    imageURL: "/new.png", recipeItems: [{ productId: 23, quantity: 0.75 }],
  });
  assert.throws(() => toCreateDishRequest({ ...draft, ingredients: [{ ...draft.ingredients[0], id: "legacy-mock" }] }));
});

test("missing inventory fields have stable defaults independent of product ID", () => {
  const first = toDishIngredient({ id: 1 });
  const second = toDishIngredient({ id: 99 });
  for (const ingredient of [first, second]) {
    assert.equal(ingredient.stock, 1000);
    assert.equal(ingredient.costPerUnit, 0);
    assert.equal(ingredient.expiresOn, "2099-12-31");
  }
});

test("imageUrl typed responses and isDeleted flags are supported alongside Swagger imageURL", () => {
  const dish = toDish({ ...source, imageURL: undefined, imageUrl: "/typed.png", isDeleted: true });
  assert.equal(dish.imageUrl, "/typed.png");
  assert.equal(dish.archived, true);
});

test("create payload preserves multiple recipe entries and their quantities", () => {
  const draft = {
    ...toDish(source),
    ingredients: [toDishIngredient(product, 2), toDishIngredient({ ...product, id: 1 }, 0.25)],
  };
  assert.deepEqual(toCreateDishRequest(draft).recipeItems, [
    { productId: 23, quantity: 2 },
    { productId: 1, quantity: 0.25 },
  ]);
});
