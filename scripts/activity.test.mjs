import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toOrder } from '../src/entities/order/lib/adapters.ts';
import { groupActivity, appendActivity } from '../src/pages/logs/model/activity.ts';

test('order table uses the saved creator, marks guests, preserves unknown historical authors', () => {
  const source = { id: 1, date: '2026-10-15T12:00:00Z', type: 'takeaway', table: null, guests: 1, status: 'created', items: [] };
  assert.equal(toOrder({ ...source, createdBy: { id: 4, name: 'Иван Петров', role: 'WAITER', source: 'EMPLOYEE' } }).responsible, 'Иван Петров');
  assert.equal(toOrder({ ...source, createdBy: { id: null, name: 'Гость', role: null, source: 'GUEST' } }).responsible, 'Гость');
  assert.equal(toOrder(source).responsible, 'Не указан');
});

test('activity pagination appends older pages without duplicates and groups by Moscow date', () => {
  const first = [{ id: '3', timestamp: '2026-10-15T22:00:00Z', author: { name: 'Иван', role: 'MANAGER' } },
    { id: '2', timestamp: '2026-10-15T21:00:00Z', author: { name: 'Гость', role: 'GUEST' } }];
  const next = [{ ...first[1] }, { id: '1', timestamp: '2026-10-15T20:59:00Z', author: { name: 'Система', role: 'SYSTEM' } }];
  const entries = appendActivity(first, next);
  assert.deepEqual(entries.map(e => e.id), ['3', '2', '1']);
  const groups = groupActivity(entries);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].id, '2026-10-16');
  assert.equal(groups[0].entries[0].author.role, 'Менеджер');
  assert.equal(groups[1].entries[0].time, '23:59');
});
