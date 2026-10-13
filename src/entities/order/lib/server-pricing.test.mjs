import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toOrder } from './adapters.ts';
import { getTodayOrderStatistics } from './calculations.ts';

test('saved orders preserve server totals and snapshots independently of current menu', () => {
  const response = { id: 1, date: '2026-10-13T12:00:00Z', status: 'completed', type: 'dine-in', table: 1,
    guests: 2, totalPrice: 250, items: [{ dishId: 2, quantity: 2, name: 'Старое название', price: 100, totalPrice: 250 }] };
  const order = toOrder(response, [{ id: 2, name: 'Новое название', salePrice: 900 }]);
  assert.equal(order.totalPrice, 250);
  assert.equal(order.items[0].price, 100);
  assert.equal(order.items[0].totalPrice, 250);
  assert.equal(order.items[0].name, 'Старое название');
  assert.equal(getTodayOrderStatistics([order], '2026-10-13').revenue, 250);
});

test('legacy missing prices stay unknown instead of using current menu prices', () => {
  const order = toOrder({ id: 1, date: '2026-10-13', status: 'created', items: [{ dishId: 2, quantity: 1 }] },
    [{ id: 2, name: 'Салат', salePrice: 900 }]);
  assert.equal(order.totalPrice, null);
  assert.equal(order.items[0].price, null);
  assert.equal(order.items[0].totalPrice, null);
  assert.equal(getTodayOrderStatistics([{ ...order, status: 'completed' }], '2026-10-13').revenue, null);
});
