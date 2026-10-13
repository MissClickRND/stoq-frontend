import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toDish, toCreateDishRequest } from './adapters.ts';
import { dishPortions, dishCost } from './calculations.ts';

test('dish renders warehouse price and stock and sends category', () => {
  const dish = toDish({ id: 1, name: 'Салат', category: 'Салаты', availablePortions: 4,
    recipeItems: [{ productId: 2, quantity: 0.5, price: 80, stock: 2, portions: 4, expiresAt: '2030-01-01', product: { id: 2, name: 'Огурец' } }] });
  assert.equal(dish.category, 'Салаты');
  assert.equal(dish.ingredients[0].costPerUnit, 80);
  assert.equal(dish.ingredients[0].stock, 2);
  assert.equal(dishPortions(dish), 4);
  assert.equal(dishCost(dish), 40);
  assert.equal(toCreateDishRequest(dish).category, 'Салаты');
});
test('missing historical price stays unknown; no invented stock', () => {
  const dish = toDish({ id: 1, name: 'Салат', recipeItems: [{ productId: 2, quantity: 1, product: { id: 2 } }] });
  assert.equal(dish.ingredients[0].stock, 0);
  assert.equal(dish.ingredients[0].costPerUnit, null);
  assert.equal(dishCost(dish), null);
});
