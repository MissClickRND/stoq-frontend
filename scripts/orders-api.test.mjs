import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { configureStore } from '@reduxjs/toolkit';
const root = path.resolve(import.meta.dirname, '..');
registerHooks({
  resolve(specifier, context, next) {
    const target = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2))
      : specifier.startsWith('.') && context.parentURL?.startsWith('file:') ? fileURLToPath(new URL(specifier, context.parentURL)) : undefined;
    if (target && !path.extname(target)) {
      const file = [target + '.ts', path.join(target, 'index.ts')].find(fs.existsSync);
      if (file) return next(pathToFileURL(file).href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    const result = next(url, context);
    return url.endsWith('/shared/api/baseQuery.ts') ? { ...result, source: String(result.source).replace('import.meta.env.VITE_API_URL', 'undefined') } : result;
  }
});
const { ordersApi } = await import('../src/entities/order/api/order.ts');
const { toOrder } = await import('../src/entities/order/lib/adapters.ts');
test('orders POST and GET use server metadata and invalidate the listing', async t => {
  assert.ok(ordersApi, 'Orders must use real server API');
  const calls = [];
  const order = { id: 1, date: '2026-10-13T12:30:00.000Z', type: 'dine-in', table: 3, guests: 4, status: 'created', totalPrice: 300,
    items: [{ dishId: 2, quantity: 1, name: 'Салат', price: 300, totalPrice: 300 }] };
  t.mock.method(globalThis, 'fetch', async request => {
    calls.push({ path: new URL(request.url).pathname, method: request.method, body: request.method === 'POST' ? await request.json() : undefined });
    return new Response(JSON.stringify(request.method === 'POST' || request.url.endsWith('/1') ? order : [order]), { headers: { 'Content-Type': 'application/json' } });
  });
  const store = configureStore({ reducer: { [ordersApi.reducerPath]: ordersApi.reducer }, middleware: g => g().concat(ordersApi.middleware) });
  t.after(() => store.dispatch(ordersApi.util.resetApiState()));
  const body = { date: order.date, type: order.type, table: 3, guests: 4, items: [{ dishId: 2, quantity: 1 }] };
  assert.deepEqual(await store.dispatch(ordersApi.endpoints.createOrder.initiate(body)).unwrap(), order);
  assert.deepEqual(calls[0], { path: '/orders', method: 'POST', body });
  assert.deepEqual(await store.dispatch(ordersApi.endpoints.getOrders.initiate()).unwrap(), [order]);
  assert.deepEqual(await store.dispatch(ordersApi.endpoints.getOrderById.initiate({ id: 1 })).unwrap(), order);
});

test('rejecting uses the existing status endpoint and preserves rejected/cancelled terminal states', async t => {
  const calls = [];
  const order = { id: 1, date: '2026-10-15T12:00:00Z', type: 'takeaway', table: null, guests: 1, status: 'rejected', items: [] };
  t.mock.method(globalThis, 'fetch', async request => {
    calls.push({ path: new URL(request.url).pathname, method: request.method, body: await request.json() });
    return new Response(JSON.stringify(order), { headers: { 'Content-Type': 'application/json' } });
  });
  const store = configureStore({ reducer: { [ordersApi.reducerPath]: ordersApi.reducer }, middleware: g => g().concat(ordersApi.middleware) });
  t.after(() => store.dispatch(ordersApi.util.resetApiState()));
  const result = await store.dispatch(ordersApi.endpoints.rejectOrder.initiate({ id: 1 })).unwrap();
  assert.deepEqual(calls, [{ path: '/orders/1/status', method: 'PATCH', body: { status: 'rejected' } }]);
  assert.equal(toOrder(result).status, 'rejected');
  assert.equal(toOrder({ ...order, status: 'cancelled' }).status, 'cancelled');
  assert.equal(toOrder({ ...order, status: 'pending_reservation' }).status, 'pending');
});
