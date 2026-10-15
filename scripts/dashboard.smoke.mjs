import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
const require = createRequire(import.meta.url);
const { chromium } = require(require.resolve('playwright', { paths: [process.argv[2] || process.cwd()] }));
const vite = await createServer({ server: { host: '127.0.0.1', port: 0, watch: null, hmr: false } });
let browser;
try {
  await vite.listen();
  const origin = 'http://127.0.0.1:' + vite.httpServer.address().port;
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } });
  const errors = [], calls = [];
  let socket, fail = false, empty = false;
  const date = days => { const value = new Date(); value.setDate(value.getDate() - days); return value.toISOString(); };
  const order = (id, days, totalPrice, quantity, status = 'completed') => ({ id, date: date(days), status, totalPrice,
    type: 'takeaway', table: null, guests: 1, items: [{ dishId: 3, quantity, price: 300, name: 'Суп' }] });
  const orders = [order(1, 1, 600, 2), order(2, 2, 300, 1), order(3, 1, 300, 1, 'created'), order(4, 10, 200, 1)];
  const unit = { id: 1, name: 'Литр', shortName: 'л' };
  const stock = [{ id: 1, productId: 1, supplyId: 1, Quantity: 3, availableQuantity: 3,
    expiresAt: date(-10), status: 'RUNNINGOUT', product: { id: 1, name: 'Молоко для дашборда', unit }, price: 80, totalPrice: 240 }];
  page.on('pageerror', error => errors.push(error.message));
  await page.route(origin + '/api/**', route => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api/, ''); calls.push(path);
    let data = [], status = 200;
    if (path === '/auth/status') data = { authenticated: true, user: { id: 1, fullName: 'Администратор', role: 'ADMIN', restaurantId: 7 } };
    else if (path === '/orders') { data = empty ? [] : orders; if (fail) { status = 503; data = { message: 'Заказы недоступны' }; } }
    else if (path === '/dishes') data = [{ id: 3, name: 'Суп', costPrice: 100 }];
    return route.fulfill({ status, json: data });
  });
  await page.routeWebSocket(/\/socket\.io\//, ws => {
    socket = ws;
    ws.send('0{"sid":"dashboard","upgrades":[],"pingInterval":25000,"pingTimeout":20000}');
    ws.onMessage(message => {
      if (message.startsWith('40/inventory,')) ws.send('40/inventory,{"sid":"dashboard"}');
      if (message.startsWith('42/inventory,')) {
        const [event, body] = JSON.parse(message.slice('42/inventory,'.length));
        if (event === 'inventory:getStock') ws.send('42/inventory,' + JSON.stringify(['inventory:stockResult', { requestId: body.requestId, data: stock }]));
        if (event === 'inventory:getExpiringSoon') ws.send('42/inventory,' + JSON.stringify(['inventory:expiringSoonResult', { requestId: body.requestId, data: [] }]));
      }
    });
  });
  await page.goto(origin + '/analytics/dashboard');
  await page.getByText('1 100 ₽', { exact: true }).first().waitFor();
  await page.getByText('Молоко для дашборда', { exact: true }).waitFor();
  await page.getByLabel('Период дашборда').click();
  await page.getByRole('option', { name: '7 дней', exact: true }).click();
  await page.getByText('900 ₽', { exact: true }).first().waitFor();
  await page.getByText('600 ₽', { exact: true }).first().waitFor();
  await page.getByText('450 ₽', { exact: true }).first().waitFor();
  await page.getByText('Завершено: 2', { exact: true }).waitFor();
  await page.getByText('Расчётная прибыль', { exact: true }).last().click();
  await page.getByRole('img', { name: /Расчётная прибыль.*Итого: 600 ₽/ }).waitFor();
  await page.getByText('Заказы', { exact: true }).last().click();
  await page.getByRole('img', { name: /Заказы.*Итого: 3/ }).waitFor();
  stock[0].availableQuantity = 30; stock[0].status = 'ACTIVE';
  socket.send('42/inventory,' + JSON.stringify(['inventory:stockChanged', { eventId: 'dashboard-change', data: stock }]));
  await page.getByText('Продуктов с низким остатком нет', { exact: true }).waitFor();
  assert.ok(!calls.some(path => path.startsWith('/inventory')));
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  fail = true;
  await page.reload();
  await page.getByText('Не удалось загрузить заказы', { exact: true }).waitFor();
  await page.getByText('Данные графика недоступны', { exact: true }).waitFor();
  fail = false; empty = true;
  await page.getByRole('button', { name: 'Повторить', exact: true }).click();
  await page.getByText('За выбранный период заказов нет', { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log('Dashboard browser smoke passed: live totals/charts/period, socket stock updates, no inventory HTTP, mobile, error/retry/empty states.');
} finally { if (browser) await browser.close(); await vite.close(); }
