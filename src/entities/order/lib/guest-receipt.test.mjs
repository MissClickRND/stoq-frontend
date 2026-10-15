import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readGuestReceipt, saveGuestReceipt } from './guest-receipt.ts';
test('guest receipt survives reload in the same tab without looking up other orders', () => {
  const entries = new Map();
  const storage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
  const order = { id: '55', type: 'takeaway', guests: 1, items: [], totalPrice: 100 };
  saveGuestReceipt(storage, '7', order);
  assert.deepEqual(readGuestReceipt(storage, '7'), order);
  assert.equal(readGuestReceipt(storage, '8'), null);
  entries.set('stoq.guest.receipt:7', '{broken');
  assert.equal(readGuestReceipt(storage, '7'), null);
  entries.set('stoq.guest.receipt:7', JSON.stringify({ id: '55', type: 'takeaway' }));
  assert.equal(readGuestReceipt(storage, '7'), null);
  assert.doesNotThrow(() => saveGuestReceipt({ setItem() { throw new Error('blocked'); } }, '7', order));
});
