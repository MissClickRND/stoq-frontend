import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('scanned UPD rows preserve line totals, fractional quantities and unknown values', async () => {
  const file = new URL('./upd-draft.ts', import.meta.url);
  assert.ok(fs.existsSync(file), 'UPD draft mapping must exist');
  const { toUpdSupplyDrafts } = await import(file.href);
  const unit = { id: 1, name: 'Килограмм', shortName: 'кг' };
  const row = { productId: 10, name: 'Сыр', quantity: 7.25, price: 775, totalPrice: 5625, unit };
  const [draft, unreadable, unitPriceOnly] = toUpdSupplyDrafts([row,
    { ...row, quantity: null, price: null, totalPrice: null }, { ...row, totalPrice: null }]);
  assert.equal(draft.product.id, 10);
  assert.equal(draft.product.unitId, 1);
  assert.equal(draft.quantity, 7.25);
  assert.equal(draft.price, 5625);
  assert.equal(draft.pricingMode, 'total');
  assert.equal(draft.expiresAt, null);
  assert.equal(unreadable.quantity, '');
  assert.equal(unreadable.price, '');
  assert.equal(unitPriceOnly.price, 775);
  assert.equal(unitPriceOnly.pricingMode, 'unit');
  assert.notEqual(draft.id, unreadable.id);
});
