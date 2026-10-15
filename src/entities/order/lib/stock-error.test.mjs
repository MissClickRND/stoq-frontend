import { test } from "node:test";
import assert from "node:assert/strict";
import * as stockError from "./stock-error.ts";

const response = { status: 400, data: {
  statusCode: 400,
  message: "Недостаточно товаров на складе. Товар ID 76: нужно 1, доступно 0",
  products: [{ productId: 76, name: "Яйцо куриное" }],
} };
const dishes = [
  { id: "1", ingredients: [{ id: "76", name: "Яйцо куриное" }] },
  { id: "2", ingredients: [{ id: "77", name: "Молоко" }] },
  { id: "3", ingredients: [{ id: "76", name: "Яйцо куриное" }] },
];

test("stock errors link server product IDs to every affected selected dish, without marking unrelated dishes", () => {
  assert.equal(typeof stockError.getOrderStockError, "function");
  const result = stockError.getOrderStockError(response, [{ dishId: "1" }, { dishId: "2" }, { dishId: "3" }], dishes);
  assert.deepEqual(result.products, [{ productId: 76, name: "Яйцо куриное" }]);
  assert.deepEqual(result.dishes, { "1": ["Яйцо куриное"], "3": ["Яйцо куриное"] });
  assert.equal(result.message, "Недостаточно продуктов: Яйцо куриное");
  assert.deepEqual(stockError.getOrderStockError(response, [{ dishId: "2" }], dishes).dishes, {});
});

test("ordinary errors keep their message and do not mark dishes unavailable", () => {
  assert.equal(typeof stockError.getOrderStockError, "function");
  for (const error of [{ data: { message: "Сервис временно недоступен" } }, new Error("Сервис временно недоступен")]) {
    const result = stockError.getOrderStockError(error, [{ dishId: "1" }], dishes);
    assert.equal(result.message, "Сервис временно недоступен");
    assert.deepEqual(result.products, []);
    assert.deepEqual(result.dishes, {});
  }
  assert.equal(stockError.getOrderStockError(null, [], []).message, "Не удалось создать заказ");
});

test("duplicate products and invalid entries do not duplicate or invent ingredient errors", () => {
  assert.equal(typeof stockError.getOrderStockError, "function");
  const result = stockError.getOrderStockError({ data: { products: [
    ...response.data.products, ...response.data.products, null, { productId: -1, name: "Неверный" }, { productId: 77, name: "Молоко" },
  ] } }, [{ dishId: "1" }, { dishId: "2" }], dishes);
  assert.deepEqual(result.dishes, { "1": ["Яйцо куриное"], "2": ["Молоко"] });
  assert.equal(result.products.length, 2);
});
