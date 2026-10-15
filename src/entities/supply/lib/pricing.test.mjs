import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCreateSupplyRequest } from './create-request.ts';
import { supplyTotal } from './calculations.ts';

test('supply sends supplier and totalPrice, calculates unit price from line total', () => {
  const product = { id: 1, unitId: 1 };
  const request = toCreateSupplyRequest({ supplyNumber: ' S1 ', supplier: ' ООО Молоко ', receivedAt: '2026-10-13T10:00:00Z',
    items: [{ id: 'draft', product, unitId: 1, quantity: 3, price: 300, pricingMode: 'total', expiresAt: '2030-01-01' }] });
  assert.equal(request.supplier, 'ООО Молоко');
  assert.equal(request.items[0].totalPrice, 300);
  assert.equal(supplyTotal({ totalPrice: 300, items: [] }), 300);
  assert.throws(() => toCreateSupplyRequest({ supplyNumber: 'S1', supplier: ' ', receivedAt: '2026-10-13', items: [] }));
});

test('supply status is sent explicitly when selected and unknown statuses are rejected', () => {
  const draft = { supplyNumber: 'S1', supplier: 'ABC', receivedAt: '2026-10-15', status: 'IN_TRANSIT',
    items: [{ id: 'draft', product: { id: 7, unitId: 1 }, unitId: 1, quantity: 3, price: 300, pricingMode: 'total', expiresAt: '2030-01-01' }] };
  assert.equal(toCreateSupplyRequest(draft).status, 'IN_TRANSIT');
  assert.throws(() => toCreateSupplyRequest({ ...draft, status: 'UNKNOWN' }));
});
