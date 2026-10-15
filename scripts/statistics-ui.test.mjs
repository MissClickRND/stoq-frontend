import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transformSync } from 'rolldown/utils';
import "@mantine/charts";
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
const root = path.resolve(import.meta.dirname, '..');
registerHooks({
  resolve(specifier, context, next) {
    const target = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : specifier.startsWith('.') && context.parentURL?.startsWith('file:') ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (target && !path.extname(target)) { const file = [`${target}.ts`, `${target}.tsx`, path.join(target, 'index.ts'), path.join(target, 'index.tsx')].find(fs.existsSync); if (file) return next(pathToFileURL(file).href, context); }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith('.css')) return { format: 'module', source: 'export default new Proxy({}, {get: (_, key) => String(key)})', shortCircuit: true };
    if (/\.[jt]sx?$/.test(url) && url.includes('/src/') && !url.includes('/node_modules/')) {
      const filename = fileURLToPath(url);
      const result = transformSync(filename, fs.readFileSync(filename, 'utf8'), { lang: url.endsWith('tsx') ? 'tsx' : 'ts', jsx: { runtime: 'automatic' } });
      return { format: 'module', source: result.code, shortCircuit: true };
    }
    return next(url, context);
  },
});
const { DashboardChart } = await import('../src/pages/dashboard/ui/components/DashboardChart/DashboardChart.tsx');
const { DishDetailsStatistics } = await import('../src/pages/dishes/ui/components/details/DishDetailsStatistics.tsx');
const { DishDistribution } = await import('../src/pages/dashboard/ui/components/DishDistribution/DishDistribution.tsx');
const { StatisticsFeedback } = await import('../src/shared/ui/statistics-feedback/index.tsx');
const writeOffs = await import('../src/pages/store/ui/components/WriteOffsModal.tsx');
const render = (Component, props) => renderToStaticMarkup(React.createElement(MantineProvider, { forceColorScheme: 'light' }, React.createElement(Component, props)));
test('chart uses server total even when the point values differ, and unknown money is a dash', () => {
  const props = { points: [{ date: '2026-10-15', label: '15 окт.', revenue: 3, earning: 1, orders: 2 }], summary: { revenue: 987, earning: null, orders: 31 }, loading: false, unavailable: false };
  assert.match(render(DashboardChart, props), /987 ₽/);
  assert.doesNotMatch(render(DashboardChart, props), />3 ₽</);
  assert.match(render(DashboardChart, { ...props, summary: { revenue: null } }), /—/);
  assert.match(render(DashboardChart, { ...props, loading: true }), /Загрузка/);
});
test('dish statistics display server today/week/rank instead of deriving them from catalog sales', () => {
  const markup = render(DishDetailsStatistics, { statistic: { today: 8, week: 42, popularity: 5, availablePortions: 71 } });
  for (const value of ['8', '42', '#5', '71 порций']) assert.ok(markup.includes(value));
  assert.doesNotMatch(render(DishDetailsStatistics, { statistic: { today: 0, week: 0, popularity: null, availablePortions: 0 } }), /#1/);
});
test('write-off history keeps decimal lost quantity, unknown legacy data and no mutation action', () => {
  assert.equal(typeof writeOffs.WriteOffsTable, 'function');
  const product = { id: 3, name: 'Молоко', unit: { shortName: 'л' } };
  const markup = render(writeOffs.WriteOffsTable, { items: [{ batchId: 81, product, writtenOffQuantity: 12.5, expiresAt: '2026-10-15T00:00:00Z', writtenOffAt: null }, { batchId: 82, product, writtenOffQuantity: null, expiresAt: '2026-10-15T00:00:00Z', writtenOffAt: null }] });
  assert.match(markup, /12,5 л/); assert.match(markup, /Молоко/); assert.match(markup, /—/); assert.doesNotMatch(markup, /<button/);
});
test('loading, true empty and error statistics have distinct visible states with retry', () => {
  assert.match(render(StatisticsFeedback, { query: { isFetching: true, isError: false } }), /Загрузка статистики/);
  const markup = render(StatisticsFeedback, { query: { isFetching: false, isError: true, refetch() {} } });
  assert.match(markup, /Статистика недоступна/); assert.match(markup, /Повторить/);
  assert.match(render(DishDistribution, { query: { currentData: { total: 0 }, isError: false, isFetching: false } }), /Блюд в меню пока нет/);
});


