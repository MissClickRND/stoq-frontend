const { chromium } = require(require.resolve('playwright', { paths: [process.argv[2] || process.cwd()] }));
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const graph = { nodes: [
  { id: 'product:1', type: 'ingredient', data: { name: 'Помидоры', quantity: 0, unit: 'кг', status: 'out_of_stock' } },
  { id: 'product:2', type: 'ingredient', data: { name: 'Базилик', quantity: 0.05, unit: 'кг', status: 'low_stock' } },
  { id: 'product:3', type: 'ingredient', data: { name: 'Спагетти', quantity: 12, unit: 'кг', status: 'available' } },
  { id: 'dish:11', type: 'dish', data: { name: 'Паста Маринара', status: 'unavailable' } },
], edges: [
  { id: 'recipe:1', source: 'product:1', target: 'dish:11', data: { required: 0.15, unit: 'кг', status: 'unavailable' } },
  { id: 'recipe:2', source: 'product:2', target: 'dish:11', data: { required: 0.01, unit: 'кг', status: 'low_stock' } },
  { id: 'recipe:3', source: 'product:3', target: 'dish:11', data: { required: 0.12, unit: 'кг', status: 'available' } },
] };
(async () => {
  const output = path.resolve('docs/verification/dependency-graph');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let mode = 'loading';
    let release;
    await page.route('**/*', async route => {
      if (!['fetch', 'xhr'].includes(route.request().resourceType())) return route.continue();
      if (new URL(route.request().url()).pathname !== '/analytics/dependencies') {
        return route.fulfill({ contentType: 'application/json', body: '{}' });
      }
      if (mode === 'loading') await new Promise(resolve => { release = resolve; });
      return route.fulfill({ status: mode === 'error' ? 503 : 200, contentType: 'application/json', body: JSON.stringify(
        mode === 'error' ? { message: 'Тестовая ошибка каталога' } : mode === 'empty' ? { nodes: [], edges: [] } : graph,
      ) });
    });
    await page.goto('http://localhost:5173/analytics/dependencies');
    await page.getByText('Загружаем граф зависимостей…', { exact: true }).waitFor();
    assert.equal(await page.getByText('Пока нет связей', { exact: true }).count(), 0);
    mode = 'success'; release();
    await page.getByLabel(/^Блюдо: Паста Маринара/).waitFor();
    await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge-path').length === 3);
    assert.equal(await page.locator('.react-flow__node').count(), 4);
    assert.equal(await page.getByLabel('Ингредиент: Базилик, 0,05 кг, Заканчивается', { exact: true }).count(), 1);
    const colors = await page.locator('.react-flow__edge-path').evaluateAll(paths => paths.map(item => item.style.stroke).sort());
    assert.deepEqual(colors, ['rgb(88, 184, 61)', 'rgb(240, 82, 98)', 'rgb(245, 165, 36)'].sort());
    await page.getByRole('button', { name: 'Показать весь граф', exact: true }).click();
    await page.screenshot({ path: path.join(output, 'graph-1440.png'), animations: 'disabled' });
    mode = 'empty';
    await page.getByRole('button', { name: 'Обновить граф', exact: true }).click();
    await page.getByText('Пока нет связей', { exact: true }).waitFor();
    assert.equal(await page.locator('.react-flow__node').count(), 0);
    mode = 'error';
    await page.getByRole('button', { name: 'Обновить граф', exact: true }).click();
    await page.getByText('Тестовая ошибка каталога', { exact: true }).waitFor();
    assert.equal(await page.getByText('Пока нет связей', { exact: true }).count(), 0);
    mode = 'success';
    await page.getByRole('button', { name: 'Повторить', exact: true }).click();
    await page.getByLabel(/^Блюдо: Паста Маринара/).waitFor();
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.getByRole('button', { name: 'Показать весь граф', exact: true }).click();
      await page.waitForFunction(() => {
        const bounds = document.querySelector('.react-flow').getBoundingClientRect();
        const nodes = [...document.querySelectorAll('.react-flow__node')];
        return nodes.length === 4 && nodes.every(node => {
          const rect = node.getBoundingClientRect();
          return rect.left >= bounds.left - 2 && rect.right <= bounds.right + 2 &&
            rect.top >= bounds.top - 2 && rect.bottom <= bounds.bottom + 2;
        });
      });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), true);
      if (width === 320) await page.screenshot({ path: path.join(output, 'graph-320.png'), fullPage: true, animations: 'disabled' });
    }
    assert.deepEqual(errors, []);
    console.log('Graph UI passed: server nodes/edges/status colors, loading/empty/error/retry, refresh and 320–1440px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
