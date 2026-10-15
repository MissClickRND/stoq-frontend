import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { configureStore } from '@reduxjs/toolkit';

const root = path.resolve(import.meta.dirname, '..');
registerHooks({
  resolve(specifier, context, next) {
    const target = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2))
      : specifier.startsWith('.') && context.parentURL?.startsWith('file:') ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (target && !path.extname(target)) {
      const file = [`${target}.ts`, path.join(target, 'index.ts')].find(fs.existsSync);
      if (file) return next(pathToFileURL(file).href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    const result = next(url, context);
    if (url.endsWith('/shared/api/baseQuery.ts')) return { ...result, source: String(result.source).replaceAll('import.meta.env.VITE_API_URL', 'undefined') };
    return result;
  },
});
const { canAccessPath, roleHome } = await import('../src/entities/user/model/access.ts');
const { userReducer } = await import('../src/entities/user/model/userSlice.ts');
const { authApi } = await import('../src/entities/auth/api/authApi.ts');
const { sessionExpired } = await import('../src/shared/lib/session-events.ts');
const { guestMenuApi, toGuestDish } = await import('../src/entities/dish/api/guest-menu.ts');
const { ordersApi } = await import('../src/entities/order/api/order.ts');
const { testPanelApi } = await import('../src/features/test-panel/api/testPanel.ts');
const user = { id: 1, fullName: 'Иван Петров', email: 'ivan@example.com', role: 'ADMIN', restaurantId: 7 };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
function makeStore(t) {
  const store = configureStore({ reducer: { user: userReducer, [authApi.reducerPath]: authApi.reducer }, middleware: get => get().concat(authApi.middleware) });
  t.after(() => store.dispatch(authApi.util.resetApiState()));
  return store;
}
test('role policy denies unknown roles and protects direct links and nested pages', () => {
  for (const role of ['ADMIN', 'MANAGER', 'WAITER', 'STOREKEEPER']) {
    for (const route of ['/analytics/dashboard', '/analytics/dependencies', '/store/1', '/store/inventory/confirm', '/supply/new', '/dishes/2', '/orders/new', '/logs', '/admin-panel', '/test']) {
      const allowed = role === 'ADMIN' || (role === 'MANAGER' && !['/admin-panel', '/test'].includes(route))
        || (['WAITER', 'STOREKEEPER'].includes(role) && /^\/(store|supply)(\/|$)/.test(route))
        || (role === 'WAITER' && (route.startsWith('/dishes') || route.startsWith('/orders') || route === '/analytics/dependencies'));
      assert.equal(canAccessPath(role, route), allowed, `${role}: ${route}`);
    }
    assert.ok(canAccessPath(role, roleHome(role)));
  }
  for (const role of [undefined, 'WAIT_CONFIRM', 'OWNER', 'GUEST']) assert.equal(canAccessPath(role, '/store'), false);
  assert.equal(canAccessPath('WAITER', '/dishes-evil'), false);
});
test('login and status use cookies and populate Redux from the actual gateway user', async t => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async request => { requests.push(request); return json({ user, authenticated: true }); });
  const store = makeStore(t);
  await store.dispatch(authApi.endpoints.login.initiate({ email: user.email, password: '1234' })).unwrap();
  assert.equal(store.getState().user.fullName, user.fullName);
  assert.equal(store.getState().user.restaurantId, 7);
  assert.equal(requests[0].credentials, 'include');
  assert.equal(new URL(requests[0].url).pathname, '/auth/login');
  store.dispatch(sessionExpired());
  const status = store.dispatch(authApi.endpoints.status.initiate());
  t.after(status.unsubscribe);
  await status.unwrap();
  assert.equal(store.getState().user.role, 'ADMIN');
});
test('registration sends complete DTOs, keeps pending employee logged out, and does not fake a restaurant session', async t => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async request => { requests.push({ path: new URL(request.url).pathname, body: await request.json() }); return json({ message: 'Готово', user: { ...user, role: 'WAIT_CONFIRM' }, restaurant: { id: 7 } }); });
  const store = makeStore(t);
  const employee = { fullName: user.fullName, email: user.email, password: '1234', restaurantId: 7 };
  await store.dispatch(authApi.endpoints.register.initiate(employee)).unwrap();
  const restaurant = { fullName: user.fullName, email: user.email, password: '1234', restaurantName: 'Кафе', restaurantAddress: 'Москва' };
  await store.dispatch(authApi.endpoints.registerRestaurant.initiate(restaurant)).unwrap();
  assert.deepEqual(requests, [{ path: '/auth/register-user', body: employee }, { path: '/auth/register-restaurant', body: restaurant }]);
  assert.equal(store.getState().user.id, undefined);
});
test('parallel 401 responses share a single refresh and retry with the refreshed user', async t => {
  let refreshes = 0, refreshed = false;
  t.mock.method(globalThis, 'fetch', async request => {
    if (new URL(request.url).pathname === '/auth/refresh') { refreshes++; await new Promise(resolve => setTimeout(resolve, 20)); refreshed = true; return json({ user: { ...user, role: 'MANAGER' } }); }
    return refreshed ? json({ authenticated: true, user: { ...user, role: 'MANAGER' } }) : json({ message: 'Expired' }, 401);
  });
  const store = makeStore(t);
  const { baseQueryWithReauth } = await import('../src/shared/api/baseQuery.ts');
  const api = { dispatch: store.dispatch, getState: store.getState, signal: new AbortController().signal, endpoint: 'status', type: 'query' };
  const results = await Promise.all([baseQueryWithReauth('/auth/status', api, {}), baseQueryWithReauth('/auth/status', api, {})]);
  assert.equal(refreshes, 1);
  assert.ok(results.every(result => result.data));
  assert.equal(store.getState().user.role, 'MANAGER');
});
test('bad login never refreshes; network failure during refresh preserves the existing session', async t => {
  const paths = [];
  let offline = false;
  t.mock.method(globalThis, 'fetch', async request => { const pathname = new URL(request.url).pathname; paths.push(pathname); if (pathname === '/auth/refresh' && offline) throw new TypeError('offline'); return json({ message: 'Unauthorized' }, 401); });
  const store = makeStore(t);
  await store.dispatch(authApi.endpoints.login.initiate({ email: user.email, password: 'wrong' }));
  assert.deepEqual(paths, ['/auth/login']);
  store.dispatch({ type: 'user/setUser', payload: user });
  offline = true;
  const status = store.dispatch(authApi.endpoints.status.initiate());
  t.after(status.unsubscribe);
  await status;
  assert.equal(store.getState().user.id, user.id);
});
test('logout clears Redux after server success; rejected logout keeps session for retry', async t => {
  let fails = true;
  t.mock.method(globalThis, 'fetch', async () => json({ ok: !fails }, fails ? 503 : 200));
  const store = makeStore(t);
  store.dispatch({ type: 'user/setUser', payload: user });
  await store.dispatch(authApi.endpoints.logout.initiate());
  assert.equal(store.getState().user.id, 1);
  fails = false;
  await store.dispatch(authApi.endpoints.logout.initiate()).unwrap();
  assert.equal(store.getState().user.id, undefined);
});
test('public guest endpoints omit staff cookies and never attempt refresh', async t => {
  const calls = [];
  const menu = [{ id: 3, name: 'Суп', category: null, salePrice: 100, available: true }];
  t.mock.method(globalThis, 'fetch', async request => {
    calls.push({ path: new URL(request.url).pathname, credentials: request.credentials });
    return new URL(request.url).pathname === '/menu' ? json(menu) : json({ message: 'Rejected' }, 401);
  });
  const store = makeStore(t);
  const query = store.dispatch(guestMenuApi.endpoints.guestMenu.initiate(''));
  t.after(query.unsubscribe);
  assert.deepEqual(await query.unwrap(), menu);
  assert.equal(toGuestDish(menu[0]).availablePortions, 1);
  assert.equal(toGuestDish({ ...menu[0], available: false }).stopped, true);
  await store.dispatch(ordersApi.endpoints.createGuestOrder.initiate({ date: '2026-10-15', type: 'takeaway', table: null, guests: 1, items: [{ dishId: 3, quantity: 1 }] }));
  assert.ok(calls.every(call => call.credentials === 'omit'));
  assert.equal(calls.some(call => call.path === '/auth/refresh'), false);
});
test('expired refresh clears user, but forbidden business operations do not refresh or log out', async t => {
  let unauthorized = false;
  const calls = [];
  t.mock.method(globalThis, 'fetch', async request => {
    calls.push(new URL(request.url).pathname);
    return json({ message: 'Denied' }, unauthorized ? 401 : 403);
  });
  const store = makeStore(t);
  const { baseQueryWithReauth } = await import('../src/shared/api/baseQuery.ts');
  const api = { dispatch: store.dispatch, getState: store.getState, signal: new AbortController().signal, endpoint: 'protected', type: 'query' };
  store.dispatch({ type: 'user/setUser', payload: user });
  await baseQueryWithReauth('/inventory', api, {});
  assert.equal(store.getState().user.id, 1);
  assert.deepEqual(calls, ['/inventory']);
  unauthorized = true;
  await baseQueryWithReauth('/inventory', api, {});
  assert.equal(store.getState().user.id, undefined);
  assert.equal(store.getState().user.sessionStatus, 'anonymous');
});
test('admin mutations use the supported gateway routes and DTOs', async t => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async request => {
    requests.push({ path: new URL(request.url).pathname, method: request.method, body: request.method === 'PATCH' ? await request.json() : undefined });
    return json(request.method === 'GET' ? [] : { ok: true });
  });
  const store = makeStore(t);
  const pending = store.dispatch(authApi.endpoints.pendingUsers.initiate());
  await pending.unwrap(); pending.unsubscribe();
  await store.dispatch(authApi.endpoints.approveUser.initiate({ id: 9, role: 'MANAGER' })).unwrap();
  await store.dispatch(authApi.endpoints.deleteEmployee.initiate(9)).unwrap();
  await store.dispatch(authApi.endpoints.updateRestaurant.initiate({ name: 'Кафе', address: 'Москва' })).unwrap();
  assert.deepEqual(requests, [
    { path: '/auth/admin/users/pending', method: 'GET', body: undefined },
    { path: '/auth/admin/users/9/approve', method: 'PATCH', body: { role: 'MANAGER' } },
    { path: '/auth/admin/users/9', method: 'DELETE', body: undefined },
    { path: '/auth/admin/restaurant', method: 'PATCH', body: { name: 'Кафе', address: 'Москва' } },
  ]);
});

test('demo login waits for a pending real status refresh before rotating cookies', async t => {
  const events = [];
  let refreshed = false;
  let releaseRefresh;
  const refreshGate = new Promise(resolve => { releaseRefresh = resolve; });
  let markRefreshStarted;
  const refreshStarted = new Promise(resolve => { markRefreshStarted = resolve; });
  const demoUser = { ...user, id: 40, restaurantId: 42, fullName: 'Демо менеджер', role: 'MANAGER' };
  t.mock.method(globalThis, 'fetch', async request => {
    const pathname = new URL(request.url).pathname;
    if (pathname === '/auth/status') {
      events.push(refreshed ? 'status-retry' : 'status-expired');
      return refreshed ? json({ authenticated: true, user }) : json({ message: 'Expired' }, 401);
    }
    if (pathname === '/auth/refresh') {
      events.push('refresh-start'); markRefreshStarted();
      await refreshGate;
      refreshed = true; events.push('refresh-complete');
      return json({ user });
    }
    assert.equal(pathname, '/test/restaurants/42/login');
    events.push('demo-login');
    assert.equal(refreshed, true, 'the old session rotation must finish before demo cookies are set');
    assert.equal(request.credentials, 'include');
    assert.deepEqual(await request.json(), { role: 'MANAGER' });
    return json({ user: demoUser });
  });
  const store = makeStore(t);
  const status = store.dispatch(authApi.endpoints.status.initiate());
  t.after(status.unsubscribe);
  await refreshStarted;
  const login = store.dispatch(testPanelApi.endpoints.demoLogin.initiate({ restaurantId: 42, role: 'MANAGER' }));
  try {
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(events, ['status-expired', 'refresh-start']);
  } finally { releaseRefresh(); }
  assert.deepEqual((await login.unwrap()).user, demoUser);
  await status.unwrap();
  assert.ok(events.indexOf('refresh-complete') < events.indexOf('demo-login'));
  assert.equal(events.filter(event => event === 'refresh-start').length, 1);
});

test('rejected public demo login does not refresh or replace the existing actor', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async request => {
    calls.push(new URL(request.url).pathname);
    return json({ message: 'Демо-вход запрещён' }, 401);
  });
  const store = makeStore(t);
  store.dispatch({ type: 'user/setUser', payload: user });
  await assert.rejects(store.dispatch(testPanelApi.endpoints.demoLogin.initiate({ restaurantId: 42, role: 'ADMIN' })).unwrap());
  assert.deepEqual(calls, ['/test/restaurants/42/login']);
  assert.equal(store.getState().user.id, user.id);
  assert.equal(store.getState().user.restaurantId, user.restaurantId);
});
