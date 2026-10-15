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
});
const { restaurantsApi } = await import('../src/entities/restaurant/api/restaurant.ts');
const { employeesApi } = await import('../src/entities/employee/api/employee.ts');
const { invitationsApi } = await import('../src/entities/invitation/api/invitation.ts');
const { authApi } = await import('../src/entities/auth/api/authApi.ts');
const { invitationStatus } = await import('../src/entities/invitation/lib/helpers.ts');
const { saveDish, archiveDish } = await import('../src/entities/dish/api/commands.ts');
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
function makeStore(t) {
  const store = configureStore({ reducer: { [restaurantsApi.reducerPath]: restaurantsApi.reducer }, middleware: get => get().concat(restaurantsApi.middleware) });
  t.after(() => store.dispatch(restaurantsApi.util.resetApiState()));
  return store;
}

test('unconnected dish commands do not manufacture saved results', () => {
  assert.equal(saveDish({ id: '27', name: 'Омлет', ingredients: [] }, '27'), undefined);
  assert.equal(archiveDish('27'), undefined);
});

test('restaurant selection loads real numeric ids publicly; failures remain errors and do not refresh cookies', async t => {
  const calls = [];
  let unavailable = true;
  t.mock.method(globalThis, 'fetch', async request => {
    calls.push({ path: new URL(request.url).pathname, credentials: request.credentials });
    return unavailable ? json({ message: 'Недоступно' }, 401) : json([{ id: 42, name: 'Кафе', address: 'Москва' }]);
  });
  const store = makeStore(t);
  const query = store.dispatch(restaurantsApi.endpoints.restaurants.initiate());
  t.after(query.unsubscribe);
  await assert.rejects(query.unwrap());
  assert.equal(restaurantsApi.endpoints.restaurants.select()(store.getState()).data, undefined);
  unavailable = false;
  assert.deepEqual(await query.refetch().unwrap(), [{ id: 42, name: 'Кафе', address: 'Москва' }]);
  assert.deepEqual(calls, [{ path: '/restaurants', credentials: 'omit' }, { path: '/restaurants', credentials: 'omit' }]);
});

test('all employees are mapped from server data and approval, role and block changes use real routes', async t => {
  const calls = [];
  const employee = { id: 9, fullName: 'Новый сотрудник', email: 'new@example.com', role: 'WAIT_CONFIRM', status: 'pending', createdAt: '2026-10-15T10:00:00Z' };
  t.mock.method(globalThis, 'fetch', async request => {
    const pathname = new URL(request.url).pathname;
    calls.push({ path: pathname, method: request.method, body: request.method === 'PATCH' ? await request.json() : undefined });
    return json(request.method === 'GET' ? [employee] : { ok: true });
  });
  const store = makeStore(t);
  const query = store.dispatch(employeesApi.endpoints.employees.initiate());
  assert.equal((await query.unwrap())[0].name, 'Новый сотрудник');
  query.unsubscribe();
  await store.dispatch(authApi.endpoints.approveUser.initiate({ id: 9, role: 'MANAGER' })).unwrap();
  await store.dispatch(employeesApi.endpoints.changeEmployeeRole.initiate({ id: '9', role: 'WAITER' })).unwrap();
  await store.dispatch(employeesApi.endpoints.setEmployeeBlocked.initiate({ id: '9', blocked: true })).unwrap();
  assert.deepEqual(calls, [
    { path: '/auth/admin/users', method: 'GET', body: undefined },
    { path: '/auth/admin/users/9/approve', method: 'PATCH', body: { role: 'MANAGER' } },
    { path: '/auth/admin/users/9/role', method: 'PATCH', body: { role: 'WAITER' } },
    { path: '/auth/admin/users/9/block', method: 'PATCH', body: { blocked: true } },
  ]);
});

test('failed employee mutation leaves server list unchanged and successful approval refreshes it', async t => {
  let fails = true, approved = false, reads = 0;
  t.mock.method(globalThis, 'fetch', async request => {
    if (request.method === 'GET') {
      reads++;
      return json([{ id: 9, fullName: 'Иван', email: 'ivan@example.com', role: approved ? 'WAITER' : 'WAIT_CONFIRM', status: approved ? 'active' : 'pending', createdAt: '2026-10-15' }]);
    }
    if (fails) return json({ message: 'Недоступно' }, 503);
    approved = true;
    return json({ ok: true });
  });
  const store = makeStore(t);
  const query = store.dispatch(employeesApi.endpoints.employees.initiate());
  t.after(query.unsubscribe);
  await query.unwrap();
  await assert.rejects(store.dispatch(authApi.endpoints.approveUser.initiate({ id: 9, role: 'WAITER' })).unwrap());
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(employeesApi.endpoints.employees.select()(store.getState()).data[0].status, 'pending');
  fails = false;
  await store.dispatch(authApi.endpoints.approveUser.initiate({ id: 9, role: 'WAITER' })).unwrap();
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(employeesApi.endpoints.employees.select()(store.getState()).data[0].status, 'active');
  assert.ok(reads >= 2);
});

test('settings load server values, preserve absent optional fields in partial updates, and report mutation failure', async t => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async request => {
    requests.push({ path: new URL(request.url).pathname, method: request.method, body: request.method === 'PATCH' ? await request.json() : undefined });
    return request.method === 'GET' ? json({ id: 7, name: 'Кафе', address: 'Москва', email: null, phone: null }) : json({ message: 'Ошибка сохранения' }, 503);
  });
  const store = makeStore(t);
  const query = store.dispatch(restaurantsApi.endpoints.currentRestaurant.initiate());
  t.after(query.unsubscribe);
  assert.deepEqual(await query.unwrap(), { id: '7', name: 'Кафе', address: 'Москва', email: '', phone: '' });
  await assert.rejects(store.dispatch(restaurantsApi.endpoints.saveRestaurant.initiate({ name: 'Новое кафе' })).unwrap());
  assert.equal(restaurantsApi.endpoints.currentRestaurant.select()(store.getState()).data.name, 'Кафе');
  assert.deepEqual(requests.find(item => item.method === 'PATCH').body, { name: 'Новое кафе' });
});

test('invitation links are generated only from server results and lifecycle maps used and revoked timestamps', async t => {
  const requests = [];
  const invitation = { id: 'server-uuid', role: 'WAITER', createdAt: '2026-10-15T10:00:00Z', expiresAt: '2026-10-17T10:00:00Z', revokedAt: null, usedAt: null };
  t.mock.method(globalThis, 'fetch', async request => {
    requests.push({ path: new URL(request.url).pathname, method: request.method, body: request.method === 'POST' ? await request.json() : undefined });
    return json(request.method === 'GET' ? [{ ...invitation, usedAt: '2026-10-16T10:00:00Z' }] : invitation);
  });
  const store = makeStore(t);
  const query = store.dispatch(invitationsApi.endpoints.invitations.initiate());
  const invitations = await query.unwrap(); query.unsubscribe();
  assert.equal(invitationStatus(invitations[0]), 'used');
  const created = await store.dispatch(invitationsApi.endpoints.createInvitation.initiate({ role: 'WAITER', hours: 48 })).unwrap();
  assert.equal(created.id, 'server-uuid');
  await store.dispatch(invitationsApi.endpoints.revokeInvitation.initiate(created.id)).unwrap();
  await store.dispatch(invitationsApi.endpoints.deleteInvitation.initiate(created.id)).unwrap();
  assert.deepEqual(requests, [
    { path: '/auth/admin/invitations', method: 'GET', body: undefined },
    { path: '/auth/admin/invitations', method: 'POST', body: { role: 'WAITER', hours: 48 } },
    { path: '/auth/admin/invitations/server-uuid/revoke', method: 'PATCH', body: undefined },
    { path: '/auth/admin/invitations/server-uuid', method: 'DELETE', body: undefined },
  ]);
});
