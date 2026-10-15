import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { configureStore } from '@reduxjs/toolkit';
const root = path.resolve(import.meta.dirname, '..');
registerHooks({ resolve(specifier, context, next) {
  const target = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : specifier.startsWith('.') && context.parentURL?.startsWith('file:') ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
  if (target && !path.extname(target)) { const file = [`${target}.ts`, path.join(target, 'index.ts')].find(fs.existsSync); if (file) return next(pathToFileURL(file).href, context); }
  return next(specifier, context);
}});
const { statisticApi } = await import('../src/entities/statistic/api/statistic.ts');
const json = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
function makeStore(t) { const store = configureStore({ reducer: { [statisticApi.reducerPath]: statisticApi.reducer }, middleware: get => get().concat(statisticApi.middleware) }); t.after(() => store.dispatch(statisticApi.util.resetApiState())); return store; }
test('business statistics use dedicated server routes and preserve unknown money and zero-balance write-offs', async t => {
  const calls = [];
  const responses = [{ days: 14, summary: { revenue: null, orders: 31 }, points: [] }, { spoiledProducts: 4 }, [{ batchId: 8, writtenOffQuantity: 12.5, writtenOffAt: null }], { items: [], trackingStartedAt: null }, { revenue: 700, popularity: null }, { count: 3, total: null }, { positions: 4, total: 99 }, { employees: 15 }];
  t.mock.method(globalThis, 'fetch', async request => { const url = new URL(request.url); calls.push(url.pathname + url.search); return json(responses[calls.length - 1]); });
  const store = makeStore(t);
  for (const [index, [name, arg]] of [['getDashboardStatistic', 14], ['getInventoryStatistic'], ['getWriteOffs'], ['getShortageStatistic', 14], ['getDishDetailsStatistic', { id: 2, days: 7 }], ['getSupplyStatistic'], ['getSupplyDetailsStatistic', 3], ['getAdminStatistic']].entries()) {
    assert.ok(statisticApi.endpoints[name], `missing ${name}`);
    const query = store.dispatch(statisticApi.endpoints[name].initiate(arg));
    assert.deepEqual(await query.unwrap(), responses[index]); query.unsubscribe();
  }
  assert.deepEqual(calls, ['/statistics/dashboard?days=14', '/inventory/statistics', '/inventory/write-offs', '/statistics/shortages?days=14', '/statistics/dishes/2?days=7', '/statistics/supplies', '/statistics/supplies/3', '/auth/admin/statistics']);
});
test('statistics failures remain errors without manufactured data', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 503, headers: { 'Content-Type': 'application/json' } }));
  const store = makeStore(t);
  assert.ok(statisticApi.endpoints.getInventoryStatistic);
  const query = store.dispatch(statisticApi.endpoints.getInventoryStatistic.initiate()); t.after(query.unsubscribe);
  await assert.rejects(query.unwrap());
  assert.equal(statisticApi.endpoints.getInventoryStatistic.select()(store.getState()).data, undefined);
});

test('inventory preview compares every submitted batch and report request explicitly asks for server counts', async t => {
  const { storeApi } = await import('../src/entities/store/api/store.ts');
  const calls = [];
  const counts = { checked: 3, updated: 1, deleted: 1, unchanged: 1 };
  t.mock.method(globalThis, 'fetch', async request => {
    calls.push({ path: new URL(request.url).pathname, method: request.method, body: await request.json() });
    return json(request.method === 'POST' ? counts : { batches: [], statistics: counts, completedAt: '2026-10-15T12:34:56Z' });
  });
  const store = makeStore(t);
  const body = { items: [{ batchId: 1, quantity: 3, remove: false }, { batchId: 2, quantity: 0, remove: true }, { batchId: 3, quantity: 8, remove: false }] };
  const preview = store.dispatch(storeApi.endpoints.previewInventory.initiate(body));
  assert.deepEqual(await preview.unwrap(), counts); preview.unsubscribe();
  const report = await store.dispatch(storeApi.endpoints.inventoryStoreReport.initiate({ ...body, includeReport: true })).unwrap();
  assert.equal(report.completedAt, '2026-10-15T12:34:56Z'); assert.deepEqual(report.statistics, counts);
  assert.deepEqual(calls, [{ path: '/inventory/preview', method: 'POST', body }, { path: '/inventory', method: 'PUT', body: { ...body, includeReport: true } }]);
});

test('stock, supply and admin mutations invalidate active statistics queries', async t => {
  const { storeApi } = await import('../src/entities/store/api/store.ts');
  const { invitationsApi } = await import('../src/entities/invitation/api/invitation.ts');
  const reads = { inventory: 0, admin: 0 };
  t.mock.method(globalThis, 'fetch', async request => {
    const url = new URL(request.url);
    if (url.pathname === '/inventory/statistics') return json({ spoiledProducts: ++reads.inventory });
    if (url.pathname === '/auth/admin/statistics') return json({ invitations: ++reads.admin });
    return json({ ok: true });
  });
  const store = makeStore(t);
  const inventory = store.dispatch(statisticApi.endpoints.getInventoryStatistic.initiate());
  const admin = store.dispatch(statisticApi.endpoints.getAdminStatistic.initiate());
  await Promise.all([inventory.unwrap(), admin.unwrap()]);
  await store.dispatch(storeApi.endpoints.writeOffStoreBatch.initiate({ batchId: 4 })).unwrap();
  await store.dispatch(invitationsApi.endpoints.revokeInvitation.initiate('invite-id')).unwrap();
  await Promise.all(store.dispatch(statisticApi.util.getRunningQueriesThunk()));
  assert.ok(reads.inventory > 1); assert.ok(reads.admin > 1);
  inventory.unsubscribe(); admin.unsubscribe();
});
