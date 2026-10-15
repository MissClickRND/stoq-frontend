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
  let rejectFails = true, socket;
  const order = { id: 9, date: '2026-10-15T12:00:00Z', type: 'takeaway', table: null, guests: 1,
    status: 'created', totalPrice: 300, items: [{ dishId: 3, quantity: 1, price: 300, totalPrice: 300, name: 'Суп' }] };
  page.on('pageerror', error => errors.push(error.message));
  await page.route(origin + '/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname.replace(/^\/api/, '');
    calls.push(path);
    let data = [], status = 200;
    if (path === '/auth/status') data = { authenticated: true, user: { id: 1, fullName: 'Официант', email: 'waiter@test.local', role: 'WAITER', restaurantId: 7 } };
    else if (path === '/orders') data = [order];
    else if (path === '/orders/9/status') {
      assert.deepEqual(request.postDataJSON(), { status: 'rejected' });
      if (rejectFails) { status = 503; data = { message: 'Повторите отклонение' }; }
      else { order.status = 'rejected'; data = order; }
    } else if (path === '/analytics/graph') data = { nodes: [], edges: [] };
    else if (path.startsWith('/statistics')) throw new Error('Waiter must not request protected statistics');
    return route.fulfill({ status, json: data });
  });
  await page.routeWebSocket(/\/socket\.io\//, ws => {
    socket = ws;
    ws.send('0{"sid":"order-test","upgrades":[],"pingInterval":25000,"pingTimeout":20000}');
    ws.onMessage(message => {
      if (message.startsWith('40/inventory,')) ws.send('40/inventory,{"sid":"order-test"}');
      if (message.startsWith('42/inventory,')) {
        const [event, body] = JSON.parse(message.slice('42/inventory,'.length));
        if (event === 'inventory:getStock') ws.send('42/inventory,' + JSON.stringify(['inventory:stockResult', { requestId: body.requestId, data: [] }]));
      }
    });
  });
  await page.goto(origin + '/orders');
  await page.getByRole('heading', { name: 'Заказы', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Подробнее', exact: true }).click();
  await page.getByRole('button', { name: 'Отклонить заказ', exact: true }).click();
  await page.getByRole('button', { name: 'Отклонить', exact: true }).click();
  await page.getByText('Повторите отклонение', { exact: true }).last().waitFor();
  assert.equal(await page.getByRole('dialog').count(), 1);
  rejectFails = false;
  await page.getByRole('button', { name: 'Отклонить', exact: true }).click();
  await page.getByText('Отклонён', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Завершить заказ', exact: true }).count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Отклонить заказ', exact: true }).count(), 0);
  await page.goto(origin + '/analytics/dependencies');
  await page.getByText('Пока нет связей', { exact: true }).waitFor();
  assert.ok(calls.includes('/analytics/graph'));
  assert.ok(!calls.some(path => path.startsWith('/statistics')));

  await page.clock.install();
  for (let index = 1; index <= 4; index++) socket.send('42/inventory,' + JSON.stringify(['inventory:stockChanged', {
    eventId: `notice-${index}`, reason: 'MANUAL_UPDATE', data: [], message: `Событие склада ${index}`,
  }]));
  await page.getByText('Событие склада 1', { exact: true }).waitFor();
  assert.ok(await page.locator('.mantine-Notification-root').count() <= 3);
  await page.clock.runFor(3500);
  assert.equal(await page.getByText('Событие склада 1', { exact: true }).count(), 0);
  assert.ok(await page.locator('.mantine-Notification-root').count() <= 3);
  await page.clock.runFor(3500);
  assert.equal(await page.locator('.mantine-Notification-root').count(), 0);
  assert.deepEqual(errors, []);
  console.log('Waiter orders/graph, rejection error/retry/terminal state, and websocket notification limit/timeout passed.');
} finally { if (browser) await browser.close(); await vite.close(); }
