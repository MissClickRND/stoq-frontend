// Run against Vite with a directory containing Playwright as the first argument.
const { chromium } = require(require.resolve('playwright', { paths: [process.argv[2] || process.cwd()] }));
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const output = path.resolve('docs/verification/responsive');
const unit = { id: 1, name: 'Килограмм', shortName: 'кг' };
const product = { id: 1, name: 'Продукт с длинным названием для проверки адаптива', unitId: 1, unit };
const dish = { id: 1, name: 'Доступный салат с длинным названием', description: 'Описание блюда для проверки переноса текста',
  salePrice: 100, costPrice: 20, category: 'Салаты', availablePortions: 5,
  recipeItems: [{ id: 1, productId: 1, dishId: 1, quantity: 0.5, price: 40, stock: 2.5, portions: 5,
    expiresAt: '2099-01-01T00:00:00Z', product }] };
const dishes = [dish, { ...dish, id: 2, name: 'Недоступное блюдо', availablePortions: 0 },
  { ...dish, id: 3, name: 'Блюдо без цены', salePrice: null }];
const order = { id: 1, date: new Date().toISOString(), type: 'dine-in', table: 3, guests: 2, status: 'completed', totalPrice: 450,
  items: [{ dishId: 1, quantity: 2, name: 'Историческое название блюда', price: 100, totalPrice: 450 }] };
const supply = { id: 1, supplyNumber: 'П-2026-0042', supplier: 'ООО Поставщик с длинным названием', totalPrice: 400,
  receivedAt: new Date().toISOString(), items: [{ id: 1, product, quantity: 10, price: 40, totalPrice: 400, expiresAt: '2099-01-01T00:00:00Z' }] };
const inventory = [{ id: 1, supplyId: 1, productId: 1, product, Quantity: 10, availableQuantity: 10,
  price: 40, totalPrice: 400, expiresAt: '2099-01-01T00:00:00Z', status: 'ACTIVE' }];
const dependencyGraph = { nodes: [
  { id: 'product:1', type: 'ingredient', data: { name: product.name, quantity: 10, unit: 'кг', status: 'available' } },
  { id: 'dish:1', type: 'dish', data: { name: dish.name, status: 'available' } },
], edges: [{ id: 'recipe:1', source: 'product:1', target: 'dish:1', data: { required: 0.5, unit: 'кг', status: 'available' } }] };
const routes = ['/analytics/dashboard', '/analytics/ingredients', '/store', '/store/1', '/store/inventory',
  '/supply', '/supply/new', '/supply/1', '/dishes', '/dishes/1', '/dishes?mode=stop', '/dishes?mode=recommended', '/dishes?mode=graph',
  '/orders', '/orders/new', '/logs', '/admin-panel', '/admin-panel?tab=establishment', '/admin-panel?tab=invitations',
  '/login', '/register/employee', '/register/restaurant', '/order/new/guest/restaurant-1',
  '/order/new/guest/restaurant-1/dish/1', '/order/new/guest/restaurant-1/dish/2',
  '/order/new/guest/restaurant-1/cart', '/order/new/guest/restaurant-1/complete', '/not-found'];

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const request = route.request();
      if (!['fetch', 'xhr'].includes(request.resourceType())) return route.continue();
      const url = new URL(request.url());
      let data = {};
      if (url.pathname === '/dishes') data = dishes;
      else if (url.pathname === '/analytics/graph') data = dependencyGraph;
      else if (/^\/dishes\/\d+$/.test(url.pathname)) data = dishes.find(item => item.id === Number(url.pathname.split('/').pop())) ?? dish;
      else if (url.pathname === '/product') data = [product];
      else if (url.pathname === '/product/units') data = [unit];
      else if (url.pathname === '/orders') data = [order];
      else if (url.pathname === '/orders/1') data = order;
      else if (url.pathname === '/supplies') data = [supply];
      else if (url.pathname === '/supplies/1') data = supply;
      else if (url.pathname === '/inventory/expiring') data = [];
      else if (/^\/inventory\/\d+$/.test(url.pathname)) data = inventory.filter(item => item.productId === Number(url.pathname.split('/').pop()));
      else if (url.pathname.startsWith('/inventory')) data = inventory;
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
    });
    const results = [];
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of process.argv.includes('--interactions-only') ? [] : routes) {
        await page.goto('http://localhost:5173' + route);
        await page.waitForLoadState('networkidle');
        const metrics = await page.evaluate(() => {
          const w = innerWidth;
          const outside = [...document.querySelectorAll('button,input,textarea,a')].filter(el => {
            const rect = el.getBoundingClientRect();
            if (!rect.width || !rect.height || getComputedStyle(el).visibility === 'hidden') return false;
            if (el.closest('.react-flow')) return false;
            let ancestor = el.parentElement;
            while (ancestor) {
              const style = getComputedStyle(ancestor);
              if (style.display === 'none' || style.visibility === 'hidden') return false;
              if (['auto', 'scroll', 'hidden'].includes(style.overflowX) && ancestor.scrollWidth > ancestor.clientWidth + 2 &&
                ancestor.getBoundingClientRect().width <= w) return false;
              ancestor = ancestor.parentElement;
            }
            return rect.left < -2 || rect.right > w + 2;
          }).map(el => ({ text: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || el.tagName).slice(0, 80),
            left: Math.round(el.getBoundingClientRect().left), right: Math.round(el.getBoundingClientRect().right) }));
          return { documentWidth: document.documentElement.scrollWidth, viewportWidth: w, outside };
        });
        results.push({ width, route, ...metrics });
        if (metrics.documentWidth > width + 2 || metrics.outside.length) {
          console.log(JSON.stringify({ width, route, ...metrics }));
          await page.screenshot({ path: path.join(output, `issue-${width}-${route.replace(/\W+/g, '-')}.png`), fullPage: true, animations: 'disabled' });
        }
      }
      console.log(`Responsive audit completed at ${width}px (${routes.length} routes).`);
    }
    async function checkFit(label) {
      const fit = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth,
        dialogs: [...document.querySelectorAll('[role=dialog]')].map(el => ({ width: el.clientWidth, scroll: el.scrollWidth,
          left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right })) }));
      assert.ok(fit.document <= fit.width + 2, `${label}: page width ${fit.document} exceeds ${fit.width}`);
      for (const dialog of fit.dialogs) {
        assert.ok(dialog.scroll <= dialog.width + 2, `${label}: content exceeds dialog width`);
        assert.ok(dialog.left >= -2 && dialog.right <= fit.width + 2, `${label}: dialog exceeds viewport`);
      }
    }
    if (!process.argv.includes('--report-only')) for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('http://localhost:5173/order/new/guest/restaurant-1');
      await page.getByRole('article', { name: dish.name, exact: true }).waitFor();
      assert.equal(await page.getByRole('article').count(), 1, 'Guest menu excludes out-of-stock and unpriced dishes');
      await page.getByRole('button', { name: 'В корзину', exact: true }).click();
      await page.getByRole('link', { name: /Корзина, блюд:/ }).click();
      await page.getByRole('button', { name: `Увеличить количество ${dish.name}`, exact: true }).waitFor();
      await page.getByRole('button', { name: `Увеличить количество ${dish.name}`, exact: true }).click();
      await checkFit(`Filled guest cart at ${width}`);
      if (width <= 400) {
        const type = await page.getByRole('combobox', { name: /^Тип заказа/ }).boundingBox();
        const table = await page.getByRole('combobox', { name: /^Стол/ }).boundingBox();
        assert.equal(Math.round(type.x), Math.round(table.x), 'Narrow checkout fields stack in one column');
      }
      if (width === 320 || width === 1440) await page.screenshot({ path: path.join(output, `guest-cart-${width}.png`), fullPage: true, animations: 'disabled' });
      await page.goto('http://localhost:5173/order/new/guest/restaurant-1/dish/2');
      await page.getByRole('button', { name: 'Добавить в корзину', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Добавить в корзину', exact: true }).isDisabled(), true);
      await page.goto('http://localhost:5173/orders');
      await page.getByRole('button', { name: 'Подробнее', exact: true }).click();
      assert.ok(await page.getByText(/450\s*₽/).count() >= 2, 'Saved order displays server total rather than quantity × current menu price');
      await checkFit(`Expanded order at ${width}`);
      await page.getByRole('button', { name: 'Открыть QR гостевого меню', exact: true }).click();
      await page.getByRole('dialog').waitFor();
      await page.getByRole('button', { name: 'Настроить QR', exact: true }).click();
      await checkFit(`QR modal at ${width}`);
      if (width === 320) await page.screenshot({ path: path.join(output, 'qr-320.png'), fullPage: true, animations: 'disabled' });
      await page.keyboard.press('Escape');
      await page.goto('http://localhost:5173/orders/new');
      await page.getByPlaceholder('Начните вводить название блюда или ингредиента').fill('Доступный');
      await page.getByRole('option', { name: dish.name, exact: true }).click();
      await page.getByLabel(`Количество ${dish.name}`, { exact: true }).waitFor();
      await checkFit(`Filled staff order at ${width}`);
      await page.goto('http://localhost:5173/supply/new');
      await page.getByPlaceholder('Начните вводить название продукта').fill('Продукт');
      await page.getByRole('option', { name: product.name, exact: true }).click();
      await checkFit(`Filled supply at ${width}`);
      await page.getByRole('button', { name: 'Отсканировать УПД', exact: true }).click();
      await page.getByRole('dialog').waitFor();
      await checkFit(`UPD modal at ${width}`);
      await page.keyboard.press('Escape');
      await page.goto('http://localhost:5173/store');
      await page.getByRole('button', { name: 'Создать продукт', exact: true }).click();
      await page.getByRole('dialog').waitFor();
      await checkFit(`Product modal at ${width}`);
      await page.keyboard.press('Escape');
      await page.goto('http://localhost:5173/dishes');
      await page.getByRole('button', { name: 'Добавить блюдо', exact: true }).click();
      await page.getByRole('dialog').waitFor();
      await checkFit(`Dish form modal at ${width}`);
      await page.getByPlaceholder('Начните вводить название ингредиента').fill('Продукт');
      await page.getByRole('option', { name: product.name, exact: true }).click();
      const quantityField = page.getByLabel(`Количество на порцию: ${product.name}, кг`, { exact: true });
      await quantityField.fill('0.5');
      const removeIngredient = await page.getByRole('button', { name: `Удалить ингредиент ${product.name}`, exact: true }).boundingBox();
      const modalBody = await page.locator('.mantine-Modal-body').boundingBox();
      assert.ok(removeIngredient.x + removeIngredient.width <= modalBody.x + modalBody.width - 8,
        'Ingredient controls must fit inside the modal body');
      await page.keyboard.press('Escape');
      if (width === 320 || width === 1440) {
        await page.goto('http://localhost:5173/store');
        await page.getByText('Провести инвентаризацию', { exact: true }).click();
        await page.getByLabel(/^Фактический остаток/).waitFor();
        await page.getByRole('button', { name: 'Перейти к подтверждению', exact: true }).click();
        await page.waitForURL('**/store/inventory/confirm');
        await checkFit(`Inventory confirmation at ${width}`);
        await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
        await page.waitForURL('**/store/inventory/report');
        await checkFit(`Inventory report at ${width}`);
      }
      console.log(`Filled forms, guest filtering/cart and dialogs passed at ${width}px.`);
    }
    if (!process.argv.includes('--report-only')) for (const width of [1024, 1440]) {
      await page.setViewportSize({ width, height: 600 });
      for (const route of ['/orders', '/orders/new', '/supply/new', '/store', '/dishes', '/admin-panel']) {
        await page.goto('http://localhost:5173' + route);
        await page.waitForLoadState('networkidle');
        await checkFit(`Short screen ${width}×600 ${route}`);
      }
      console.log(`Short screen checks passed at ${width}×600.`);
    }
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ results, errors }, null, 2));
    console.log(`Runtime errors: ${JSON.stringify([...new Set(errors)])}`);
    const failures = results.filter(row => row.documentWidth > row.width + 2 || row.outside.length);
    console.log(`Overflow findings: ${failures.length} / ${results.length}`);
    if (!process.argv.includes('--report-only')) {
      assert.deepEqual([...new Set(errors)], []);
      assert.equal(failures.length, 0, 'Routes must fit their viewport; see responsive report');
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
