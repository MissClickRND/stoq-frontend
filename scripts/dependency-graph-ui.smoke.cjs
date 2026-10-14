const { chromium } = require(require.resolve('playwright', { paths: [process.argv[2] || process.cwd()] }));
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const graph = { nodes: [
  { id: 'product:1', type: 'ingredient', data: { name: 'Помидоры', quantity: 0, unit: 'кг', status: 'out_of_stock' } },
  { id: 'product:2', type: 'ingredient', data: { name: 'Базилик', quantity: 0.05, unit: 'кг', status: 'low_stock' } },
  { id: 'product:3', type: 'ingredient', data: { name: 'Спагетти', quantity: 12, unit: 'кг', status: 'available' } },
  { id: 'dish:11', type: 'dish', data: { name: 'Паста Маринара', status: 'unavailable' } },
  { id: 'dish:12', type: 'dish', data: { name: 'Паста с сыром', status: 'available' } },
  { id: 'dish:13', type: 'dish', data: { name: 'Зелёный салат', status: 'low_stock' } },
  { id: 'dish:14', type: 'dish', data: { name: 'Блюдо без состава', status: 'available' } },
], edges: [
  { id: 'recipe:1', source: 'product:1', target: 'dish:11', data: { required: 0.15, unit: 'кг', status: 'unavailable' } },
  { id: 'recipe:2', source: 'product:2', target: 'dish:11', data: { required: 0.01, unit: 'кг', status: 'low_stock' } },
  { id: 'recipe:3', source: 'product:3', target: 'dish:11', data: { required: 0.12, unit: 'кг', status: 'available' } },
  { id: 'recipe:4', source: 'product:3', target: 'dish:12', data: { required: 0.2, unit: 'кг', status: 'available' } },
  { id: 'recipe:5', source: 'product:2', target: 'dish:13', data: { required: 0.03, unit: 'кг', status: 'low_stock' } },
] };
(async () => {
  const output = path.resolve(process.env.GRAPH_UI_OUTPUT || 'docs/verification/dependency-graph');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let response = 'loading';
    let data = graph;
    let release;
    await page.route('**/*', async route => {
      if (!['fetch', 'xhr'].includes(route.request().resourceType())) return route.continue();
      if (new URL(route.request().url()).pathname !== '/analytics/graph') {
        return route.fulfill({ contentType: 'application/json', body: '{}' });
      }
      if (response === 'loading') await new Promise(resolve => { release = resolve; });
      return route.fulfill({ status: response === 'error' ? 503 : 200, contentType: 'application/json', body: JSON.stringify(
        response === 'error' ? { message: 'Тестовая ошибка каталога' } : response === 'empty' ? { nodes: [], edges: [] } : data,
      ) });
    });
    const sidebar = page.getByRole('complementary', { name: 'Выбор блюда для анализа' });
    const selectDish = name => sidebar.getByRole('button', { name: `Показать связи блюда ${name}`, exact: true }).click();
    async function expectGraph(ids, edges) {
      await page.waitForFunction(({ ids, edges }) => {
        const actual = [...document.querySelectorAll('.react-flow__node')].map(node => node.getAttribute('data-id')).sort();
        return JSON.stringify(actual) === JSON.stringify([...ids].sort()) && document.querySelectorAll('.react-flow__edge-path').length === edges;
      }, { ids, edges });
    }
    async function fitVisibleGraph() {
      await page.getByRole('button', { name: /^(Вписать в экран|Показать весь граф)$/ }).click();
      await page.waitForFunction(() => {
        const bounds = document.querySelector('.react-flow').getBoundingClientRect();
        return [...document.querySelectorAll('.react-flow__node')].every(node => {
          const rect = node.getBoundingClientRect();
          return rect.left >= bounds.left - 2 && rect.right <= bounds.right + 2 &&
            rect.top >= bounds.top - 2 && rect.bottom <= bounds.bottom + 2;
        });
      });
    }
    await page.goto((process.env.GRAPH_UI_URL || 'http://localhost:5173') + '/analytics/dependencies');
    await page.getByText('Загружаем граф зависимостей…', { exact: true }).waitFor();
    assert.equal(await page.getByText('Пока нет связей', { exact: true }).count(), 0);
    response = 'success'; release();
    await expectGraph(['product:1', 'product:2', 'product:3', 'dish:11'], 3);
    await page.getByRole('region', { name: 'Состав блюда Паста Маринара', exact: true }).waitFor();
    const colors = await page.locator('.react-flow__edge-path').evaluateAll(paths => paths.map(item => item.style.stroke).sort());
    assert.deepEqual(colors, ['rgb(88, 184, 61)', 'rgb(240, 82, 98)', 'rgb(245, 165, 36)'].sort());
    assert.equal(await page.getByLabel('Ингредиент: Базилик, 0,05 кг, Заканчивается', { exact: true }).count(), 1);
    await fitVisibleGraph();
    await page.screenshot({ path: path.join(output, 'graph-dish-1440.png'), animations: 'disabled' });

    await sidebar.getByLabel('Поиск блюда в списке').fill('ПАСТ');
    assert.equal(await sidebar.getByRole('button', { name: /^Показать связи блюда/ }).count(), 2);
    await selectDish('Паста с сыром');
    await expectGraph(['product:3', 'dish:12'], 1);
    await sidebar.getByLabel('Поиск блюда в списке').fill('неизвестное');
    await sidebar.getByText('Нет блюд по заданным фильтрам', { exact: true }).waitFor();
    await expectGraph(['product:3', 'dish:12'], 1);
    await sidebar.getByLabel('Поиск блюда в списке').fill('');
    await sidebar.getByRole('switch', { name: 'Только проблемные', exact: true }).check();
    assert.equal(await sidebar.getByRole('button', { name: /^Показать связи блюда/ }).count(), 2);
    await selectDish('Зелёный салат');
    await expectGraph(['product:2', 'dish:13'], 1);
    await sidebar.getByRole('switch', { name: 'Только проблемные', exact: true }).uncheck();
    await selectDish('Блюдо без состава');
    await expectGraph(['dish:14'], 0);
    await sidebar.getByText('Состав пока не указан', { exact: true }).waitFor();

    await sidebar.getByText('Вся карта', { exact: true }).click();
    await expectGraph(graph.nodes.map(node => node.id), 5);
    await page.getByLabel('Поиск по карте зависимостей').fill('ничего нет');
    await page.getByText('Ничего не найдено', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Очистить поиск', exact: true }).click();
    await fitVisibleGraph();
    await page.screenshot({ path: path.join(output, 'graph-all-1440.png'), animations: 'disabled' });
    await page.getByRole('button', { name: /^Блюдо: Паста с сыром,/ }).click();
    await expectGraph(['product:3', 'dish:12'], 1);
    assert.equal(await sidebar.getByRole('radio', { name: 'По блюду', exact: true }).isChecked(), true);
    await sidebar.getByText('Вся карта', { exact: true }).click();
    await expectGraph(graph.nodes.map(node => node.id), 5);
    await page.getByRole('button', { name: /^Блюдо: Зелёный салат,/ }).press('Enter');
    await expectGraph(['product:2', 'dish:13'], 1);

    data = { nodes: graph.nodes.filter(node => node.id !== 'dish:13'), edges: graph.edges.filter(edge => edge.target !== 'dish:13') };
    await page.getByRole('button', { name: 'Обновить граф', exact: true }).click();
    await page.getByText('Выберите блюдо', { exact: true }).waitFor();
    await expectGraph([], 0);
    data = graph;
    await page.getByRole('button', { name: 'Обновить граф', exact: true }).click();
    await expectGraph(['product:2', 'dish:13'], 1);
    response = 'empty';
    await page.getByRole('button', { name: 'Обновить граф', exact: true }).click();
    await page.getByText('Пока нет связей', { exact: true }).waitFor();
    await expectGraph([], 0);
    response = 'error';
    await page.getByRole('button', { name: 'Обновить граф', exact: true }).click();
    await page.getByText('Тестовая ошибка каталога', { exact: true }).waitFor();
    assert.equal(await page.getByText('Пока нет связей', { exact: true }).count(), 0);
    response = 'success';
    await page.getByRole('button', { name: 'Повторить', exact: true }).click();
    await expectGraph(['product:2', 'dish:13'], 1);
    await selectDish('Паста Маринара');

    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await fitVisibleGraph();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), true);
      await expectGraph(['product:1', 'product:2', 'product:3', 'dish:11'], 3);
      if (width === 320) await page.screenshot({ path: path.join(output, 'graph-dish-320.png'), fullPage: true, animations: 'disabled' });
      await sidebar.getByText('Вся карта', { exact: true }).click();
      await expectGraph(graph.nodes.map(node => node.id), 5);
      await fitVisibleGraph();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), true);
      await sidebar.getByText('По блюду', { exact: true }).click();
      await expectGraph(['product:1', 'product:2', 'product:3', 'dish:11'], 3);
    }
    await page.evaluate(() => localStorage.setItem('stoq-color-scheme', 'dark'));
    await page.reload();
    await expectGraph(['product:1', 'product:2', 'product:3', 'dish:11'], 3);
    assert.equal(await page.locator('html').getAttribute('data-mantine-color-scheme'), 'dark');
    await fitVisibleGraph();
    await page.screenshot({ path: path.join(output, 'graph-dish-dark.png'), animations: 'disabled' });
    assert.deepEqual(errors, []);
    console.log('Graph UI passed: dish/all modes, shared ingredients, composition, search/problem filter, click/keyboard, refresh/deletion/empty/error/retry, 320–1440px and dark theme.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
