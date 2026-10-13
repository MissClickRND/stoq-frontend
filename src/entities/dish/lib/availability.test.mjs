import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as calculations from './calculations.ts';
import { toDish } from './adapters.ts';

test('guests can order only dishes with portions and a known sale price', () => {
  assert.equal(typeof calculations.dishCanBeOrdered, 'function');
  const dish = toDish({ id: 1, name: 'Салат', salePrice: 100, availablePortions: 2 });
  assert.equal(calculations.dishCanBeOrdered(dish), true);
  for (const patch of [{ availablePortions: 0 }, { archived: true }, { stopped: true }, { priceKnown: false }])
    assert.equal(calculations.dishCanBeOrdered({ ...dish, ...patch }), false);
  assert.equal(calculations.dishCanBeOrdered(toDish({ id: 1, name: 'Вода', salePrice: 0, availablePortions: 2 })), true);
  assert.equal(calculations.dishCanBeOrdered(toDish({ id: 1, name: 'Без цены', salePrice: null, availablePortions: 2 })), false);
});

test('older responses derive availability from nonexpired ingredient stock', () => {
  assert.equal(typeof calculations.dishCanBeOrdered, 'function');
  const dish = toDish({ id: 1, name: 'Салат', salePrice: 100, recipeItems: [
    { productId: 2, quantity: 0.5, stock: 2, expiresAt: '2030-01-01', product: { id: 2 } }] });
  assert.equal(calculations.dishCanBeOrdered(dish), true);
  assert.equal(calculations.dishCanBeOrdered({ ...dish, ingredients: [] }), false);
  assert.equal(calculations.dishCanBeOrdered({ ...dish, ingredients: [{ ...dish.ingredients[0], stock: 0.1 }] }), false);
  assert.equal(calculations.dishCanBeOrdered({ ...dish, ingredients: [{ ...dish.ingredients[0], expiresOn: '2000-01-01' }] }), false);
});
