import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCreateOrderRequest, toOrder } from './adapters.ts';
test('order sends ISO metadata and numeric item IDs, no client prices or names', () => {
  assert.deepEqual(toCreateOrderRequest({ createdAt: '2026-10-13T12:30:00Z', type: 'dine-in', table: '3', guests: 4,
    items: [{ dishId: '2', quantity: '1', name: 'Салат', price: 999 }] }), {
    date: '2026-10-13T12:30:00.000Z', type: 'dine-in', table: 3, guests: 4, items: [{ dishId: 2, quantity: 1 }] });
});
test('order GET maps metadata and real dish prices; missing menu price stays null', () => {
  const source = { id: 1, date: '2026-10-13T12:30:00Z', type: 'takeaway', table: null, guests: 1, status: 'created', items: [{ dishId: 2, quantity: 1 }] };
  assert.equal(toOrder(source, [{ id: 2, name: 'Салат', salePrice: 300 }]).items[0].price, 300);
  assert.equal(toOrder(source, []).items[0].price, null);
  assert.equal(toOrder(source, []).createdAt, source.date);
});
