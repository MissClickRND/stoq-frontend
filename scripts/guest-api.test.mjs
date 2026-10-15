import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
});
const { guestMenuApi, toGuestDish } = await import('../src/entities/dish/api/guest-menu.ts');
const { ordersApi } = await import('../src/entities/order/api/order.ts');
const { toCreateOrderRequest } = await import('../src/entities/order/lib/adapters.ts');
const createStore = () => configureStore({
  reducer: { [guestMenuApi.reducerPath]: guestMenuApi.reducer },
  middleware: get => get().concat(guestMenuApi.middleware),
});

test('guest menu adapter preserves public photo, description and recommendation rank', () => {
  const dish = toGuestDish({ id: 7, name: 'Soup', category: 'Food', salePrice: 100, available: true,
    imageURL: 'https://example.com/soup.jpg', description: 'Hot soup', recommended: true, recommendationRank: 2 });
  assert.equal(dish.imageUrl, 'https://example.com/soup.jpg');
  assert.equal(dish.description, 'Hot soup');
  assert.equal(dish.recommended, true);
  assert.equal(dish.recommendationRank, 2);
  assert.equal(toGuestDish({ id: 8, name: 'Old menu', available: true }).recommended, false);
});

test('guest menu selects the URL restaurant without staff cookies and separates cached restaurants', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async request => {
    calls.push(request);
    const id = request.headers.get('X-Restaurant-Id');
    return Response.json([{ id: Number(id), name: `Menu ${id}`, salePrice: 100, available: true }]);
  });
  const store = createStore();
  t.after(() => store.dispatch(guestMenuApi.util.resetApiState()));
  const seven = { restaurantId: '7', search: 'суп' };
  const eight = { restaurantId: '8', search: 'суп' };
  assert.equal((await store.dispatch(guestMenuApi.endpoints.guestMenu.initiate(seven)).unwrap())[0].name, 'Menu 7');
  assert.equal((await store.dispatch(guestMenuApi.endpoints.guestMenu.initiate(eight)).unwrap())[0].name, 'Menu 8');
  assert.equal(guestMenuApi.endpoints.guestMenu.select(seven)(store.getState()).data[0].name, 'Menu 7');
  assert.equal(calls.length, 2);
  assert.ok(calls.every(request => request.credentials === 'omit'));
  assert.ok(calls.every(request => new URL(request.url).pathname === '/menu'));
  assert.ok(calls.every(request => new URL(request.url).searchParams.get('search') === 'суп'));
});

test('guest checkout sends restaurant header and server-priced items; only its own menu refreshes', async t => {
  const calls = [];
  const result = { id: 55, date: '2026-10-15T12:00:00.000Z', type: 'takeaway', table: null, guests: 1,
    status: 'created', totalPrice: 325, items: [{ dishId: 1, quantity: 1, price: 325, totalPrice: 325 }] };
  t.mock.method(globalThis, 'fetch', async request => {
    calls.push({ path: new URL(request.url).pathname, restaurantId: request.headers.get('X-Restaurant-Id'),
      credentials: request.credentials, body: request.method === 'POST' ? await request.json() : undefined });
    return Response.json(request.method === 'POST' ? result : []);
  });
  const store = createStore();
  t.after(() => store.dispatch(guestMenuApi.util.resetApiState()));
  await store.dispatch(guestMenuApi.endpoints.guestMenu.initiate({ restaurantId: '7', search: '' })).unwrap();
  await store.dispatch(guestMenuApi.endpoints.guestMenu.initiate({ restaurantId: '8', search: '' })).unwrap();
  const order = toCreateOrderRequest({ createdAt: result.date, type: 'takeaway', table: null, guests: 1,
    items: [{ dishId: '1', quantity: 1, price: 1, name: 'Client price must be ignored' }] });
  assert.deepEqual(await store.dispatch(ordersApi.endpoints.createGuestOrder.initiate({ restaurantId: '7', order })).unwrap(), result);
  await Promise.all(store.dispatch(guestMenuApi.util.getRunningQueriesThunk()));
  assert.deepEqual(calls.find(call => call.path === '/orders'), {
    path: '/orders', restaurantId: '7', credentials: 'omit', body: {
      date: result.date, type: 'takeaway', table: null, guests: 1, items: [{ dishId: 1, quantity: 1 }],
    },
  });
  assert.equal(calls.filter(call => call.path === '/menu' && call.restaurantId === '7').length, 2);
  assert.equal(calls.filter(call => call.path === '/menu' && call.restaurantId === '8').length, 1);
});

test('guest authorization failure never refreshes staff credentials or fetches protected orders', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async request => {
    calls.push(request);
    return Response.json({ message: 'Unavailable' }, { status: 401 });
  });
  const store = createStore();
  t.after(() => store.dispatch(guestMenuApi.util.resetApiState()));
  await assert.rejects(store.dispatch(guestMenuApi.endpoints.guestMenu.initiate({ restaurantId: '7', search: '' })).unwrap(), { status: 401 });
  assert.equal(calls.length, 1);
  assert.equal(new URL(calls[0].url).pathname, '/menu');
  assert.equal(calls[0].credentials, 'omit');
});
