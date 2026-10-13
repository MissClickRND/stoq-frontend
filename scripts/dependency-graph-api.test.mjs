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
  },
});
const module = await import('../src/entities/dependency-graph/api/dependencyGraph.ts');
const graph = { nodes: [
  { id: 'product:1', type: 'ingredient', data: { name: 'Базилик', quantity: 0.05, unit: 'кг', status: 'available' } },
  { id: 'dish:11', type: 'dish', data: { name: 'Паста', status: 'low_stock' } },
], edges: [{ id: 'recipe:2', source: 'product:1', target: 'dish:11', data: { required: 0.01, unit: 'кг', status: 'low_stock' } }] };
test('graph loads real API data without recalculating server statuses and refreshes after inventory changes', async t => {
  assert.ok(module.dependencyGraphApi, 'Graph must use the server API instead of fixtures');
  const api = module.dependencyGraphApi;
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async request => {
    assert.equal(new URL(request.url).pathname, '/analytics/graph');
    calls++;
    return new Response(JSON.stringify(graph), { headers: { 'Content-Type': 'application/json' } });
  });
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: g => g().concat(api.middleware) });
  const operation = store.dispatch(api.endpoints.getDependencyGraph.initiate());
  t.after(() => { operation.unsubscribe(); store.dispatch(api.util.resetApiState()); });
  assert.deepEqual(await operation.unwrap(), graph);
  store.dispatch(api.util.invalidateTags(['Store']));
  await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
  assert.equal(calls, 2);
  assert.deepEqual(api.endpoints.getDependencyGraph.select()(store.getState()).data, graph);
});
