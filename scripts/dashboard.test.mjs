import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardStatistics, getLowStockProducts } from '../src/pages/dashboard/model/calculations.ts';

const now = new Date(2026, 9, 15, 18);
const order = (overrides = {}) => ({ id: '1', createdAt: new Date(2026, 9, 15, 12).toISOString(), status: 'completed',
  totalPrice: 600, items: [{ dishId: '3', quantity: 2 }], ...overrides });
const dishes = [{ id: 3, costPrice: 100 }];
test('dashboard uses completed sale snapshots, current recipe cost and all accepted order counts', () => {
  const result = getDashboardStatistics([order(), order({ status: 'processing' }), order({ status: 'rejected' }),
    order({ status: 'cancelled' }), order({ createdAt: new Date(2026, 9, 1).toISOString() }),
    order({ createdAt: 'bad' }), order({ createdAt: new Date(2026, 9, 20).toISOString() })], dishes, 7, now);
  assert.equal(result.points.length, 7);
  assert.equal(result.orders, 2);
  assert.equal(result.completed, 1);
  assert.equal(result.revenue, 600);
  assert.equal(result.earning, 400);
  assert.equal(result.averageCheck, 600);
  assert.equal(result.points[0].orders, 0);
  assert.equal(result.points.at(-1).orders, 2);
});
test('missing historical prices or current costs never masquerade as zero', () => {
  const unknownPrice = getDashboardStatistics([order({ totalPrice: null })], dishes, 7, now);
  assert.equal(unknownPrice.revenue, null);
  assert.equal(unknownPrice.earning, null);
  assert.equal(unknownPrice.averageCheck, null);
  const unknownCost = getDashboardStatistics([order()], undefined, 7, now);
  assert.equal(unknownCost.revenue, 600);
  assert.equal(unknownCost.earning, null);
  assert.equal(getDashboardStatistics([order()], [{ id: 3, costPrice: 0 }], 7, now).earning, 600);
  assert.equal(getDashboardStatistics([], undefined, 7, now).earning, 0);
});
test('period boundaries include the first local day and zero-fill missing days', () => {
  const orders = [order({ createdAt: new Date(2026, 9, 9, 0).toISOString() }), order({ createdAt: new Date(2026, 9, 8, 23, 59).toISOString() })];
  assert.equal(getDashboardStatistics(orders, dishes, 7, now).orders, 1);
  assert.equal(getDashboardStatistics(orders, dishes, 14, now).orders, 2);
  assert.equal(getDashboardStatistics([], dishes, 30, now).points.length, 30);
});
const batch = (productId, quantity, overrides = {}) => ({ productId, Quantity: 100, availableQuantity: quantity,
  product: { id: productId, name: `Продукт ${productId}`, unit: { shortName: 'кг' } },
  status: 'RUNNINGOUT', expiresAt: '2027-01-01', ...overrides });
test('low stock aggregates valid batches and excludes products with another full batch', () => {
  const result = getLowStockProducts([batch(1, '2'), batch(1, 3), batch(2, 2), batch(2, 50, { status: 'ACTIVE' }),
    batch(3, 6), batch(3, 6), batch(4, 1, { expiresAt: '2026-01-01' }), batch(5, 0), batch(6, 1)], now);
  assert.deepEqual(result.map(entry => [entry.product.id, entry.quantity]), [[6, 1], [1, 5]]);
});
