import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCreateOrderRequest, toOrder } from './adapters.ts';
test('order sends ISO metadata and numeric item IDs, no client prices or names', () => {
  assert.deepEqual(toCreateOrderRequest({ createdAt: '2026-10-13T12:30:00Z', type: 'dine-in', table: '3', guests: 4,
    items: [{ dishId: '2', quantity: '1', name: 'Салат', price: 999 }] }), {
    date: '2026-10-13T12:30:00.000Z', type: 'dine-in', table: 3, guests: 4, items: [{ dishId: 2, quantity: 1 }] });
});
test('order GET maps metadata and saved server prices; unknown historical prices stay null', () => {
  const source = { id: 1, date: '2026-10-13T12:30:00Z', type: 'takeaway', table: null, guests: 1, status: 'created', items: [{ dishId: 2, quantity: 1 }] };
  const priced = { ...source, totalPrice: 300, items: [{ ...source.items[0], name: 'Салат', price: 300, totalPrice: 300 }] };
  assert.equal(toOrder(priced).items[0].price, 300);
  assert.equal(toOrder(priced).totalPrice, 300);
  assert.equal(toOrder(source).items[0].price, null);
  assert.equal(toOrder(source).createdAt, source.date);
});
