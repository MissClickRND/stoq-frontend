const { chromium } = require(require.resolve('playwright', { paths: [process.argv[2] || process.cwd()] }));
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
(async () => {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { host: '127.0.0.1', port: 0, watch: null, hmr: false } });
  await vite.listen();
  const origin = 'http://127.0.0.1:' + vite.httpServer.address().port;
  const browser = await chromium.launch({ headless: true });
  let page;
  try {
    const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
    page = await context.newPage(); page.setDefaultTimeout(12000);
    const errors = [], requests = [], sockets = [];
    page.on('pageerror', error => errors.push(error.message));
    const roles = { ADMIN: 'Администратор', MANAGER: 'Менеджер', WAITER: 'Официант', STOREKEEPER: 'Кладовщик' };
    const demo = id => ({ id, name: `Демо ресторан ${id}`, address: `Адрес ${id}`, accounts: Object.keys(roles).map((role, index) => ({ id: id * 10 + index, fullName: `Демо ${id} ${role}`, email: `${id}-${role}@example.com`, role, restaurantId: id })) });
    let actor = { id: 1, fullName: 'Реальный админ', email: 'real@example.com', role: 'ADMIN', restaurantId: 7 };
    let restaurants = [], failCreate = true, failLogin = false, failList = false;
    let holdDish = null, releaseDish = null;
    const marker = () => `Данные-${actor.restaurantId}-${actor.role}`;
    await page.route('**/*', async route => {
      const request = route.request();
      if (!['fetch', 'xhr'].includes(request.resourceType())) return route.continue();
      const pathname = new URL(request.url()).pathname.replace(/^\/api(?=\/)/, '');
      const body = request.postData() ? JSON.parse(request.postData()) : undefined;
      requests.push({ path: pathname, method: request.method(), body, actorId: actor.id, restaurantId: actor.restaurantId });
      let data = [], status = 200;
      if (pathname === '/auth/status') data = { authenticated: true, user: actor };
      else if (pathname === '/test/restaurant') {
        if (failCreate) { status = 503; data = { message: 'Создание недоступно' }; }
        else { restaurants = [demo(42), demo(84)]; data = { restaurant: restaurants[0], accounts: restaurants[0].accounts, message: 'Создан отдельный ресторан' }; }
      } else if (pathname === '/test/restaurants') {
        status = failList ? 503 : 200; data = failList ? { message: 'Список демо недоступен' } : restaurants;
      } else if (/^\/test\/restaurants\/\d+\/login$/.test(pathname)) {
        if (failLogin) { status = 401; data = { message: 'Демо-вход запрещён' }; }
        else {
          const restaurant = restaurants.find(item => item.id === Number(pathname.split('/')[3]));
          actor = restaurant.accounts.find(item => item.role === body.role);
          data = { user: actor };
        }
      } else if (pathname === '/auth/admin/users') data = [{ ...actor, status: 'active', createdAt: '2026-10-15' }];
      else if (pathname === '/auth/admin/restaurant') data = { id: actor.restaurantId, name: 'Текущий ресторан', address: 'Текущий адрес' };
      else if (pathname === '/dishes') {
        const name = marker();
        if (holdDish) await holdDish;
        data = [{ id: actor.id, name, category: 'Демо', salePrice: 100, availablePortions: 4, recipeItems: [] }];
      } else if (pathname.startsWith('/statistics')) data = { total: 1, active: 1, stopList: 0, lowStock: 0 };
      else if (pathname === '/restaurants') data = restaurants.map(({ id, name, address }) => ({ id, name, address }));
      else if (pathname === '/menu') data = [];
      return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    });
    await page.routeWebSocket(/\/socket\.io\//, ws => {
      const connectionActor = { ...actor };
      sockets.push({ restaurantId: connectionActor.restaurantId, role: connectionActor.role });
      ws.send('0{"sid":"demo-ui","upgrades":[],"pingInterval":25000,"pingTimeout":20000}');
      ws.onMessage(message => {
        if (message.startsWith('40/')) return ws.send(message.split(',')[0] + ',{"sid":"demo-ui"}');
        if (!message.startsWith('42/')) return;
        const comma = message.indexOf(','), namespace = message.slice(2, comma);
        const [event, payload] = JSON.parse(message.slice(comma + 1));
        const result = { 'inventory:getStock': 'inventory:stockResult', 'inventory:getExpiringSoon': 'inventory:expiringSoonResult', 'recommendations:getStopList': 'recommendations:stopListResult', 'recommendations:getDishRecommendations': 'recommendations:dishRecommendationsResult' }[event];
        const stock = [{ id: connectionActor.id, supplyId: 100, productId: 100, price: 10, totalPrice: 100, availableQuantity: 10, Quantity: 10, expiresAt: '2027-10-15', status: 'ACTIVE', product: { id: 100, name: `Данные-${connectionActor.restaurantId}-${connectionActor.role}`, unit: { id: 1, name: 'Килограмм', shortName: 'кг' } } }];
        if (result) ws.send('42' + namespace + ',' + JSON.stringify([result, { ...payload, data: event === 'inventory:getStock' ? stock : [] }]));
      });
    });
    const navigate = async pathname => {
      await page.evaluate(pathname => { history.pushState({}, '', pathname); window.dispatchEvent(new PopStateEvent('popstate')); }, pathname);
      await page.waitForURL(origin + pathname);
    };
    const openDemo = async () => {
      await navigate('/login');
      await page.getByRole('button', { name: 'Тестовый вход', exact: true }).click();
      await page.getByRole('combobox', { name: 'Тестовый ресторан', exact: true }).waitFor();
    };

    await page.goto(origin + '/test');
    await page.getByText('Панель тестирования', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Создать отдельный ресторан', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Создание недоступно' }).waitFor();
    assert.equal(await page.getByRole('status').count(), 0);
    failCreate = false;
    await page.getByRole('button', { name: 'Создать отдельный ресторан', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Демо ресторан 42' }).waitFor();
    assert.equal(actor.restaurantId, 7);
    assert.equal(requests.filter(item => /\/login$/.test(item.path)).length, 0);
    await navigate('/admin-panel');
    await page.getByText('Реальный админ', { exact: true }).first().waitFor();
    assert.equal(requests.filter(item => item.path === '/auth/admin/users').at(-1).restaurantId, 7);

    failList = true;
    await navigate('/login');
    await page.getByRole('button', { name: 'Тестовый вход', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Список демо недоступен' }).waitFor();
    failList = false;
    await page.getByRole('button', { name: 'Повторить', exact: true }).click();
    await page.getByRole('combobox', { name: 'Тестовый ресторан', exact: true }).waitFor();
    for (const label of Object.values(roles)) assert.equal(await page.getByRole('button', { name: label, exact: true }).count(), 1);
    assert.equal(await page.getByRole('link', { name: 'Открыть как гость', exact: true }).getAttribute('href'), '/order/new/guest/42');
    await page.screenshot({ path: path.join(os.tmpdir(), 'stoq-demo-login.png'), fullPage: true });
    failLogin = true;
    await page.getByRole('button', { name: roles.ADMIN, exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Демо-вход запрещён' }).waitFor();
    assert.equal(actor.id, 1);
    assert.equal(requests.filter(item => item.path === '/auth/refresh').length, 0);
    failLogin = false;
    let previousMarker;
    for (const role of Object.keys(roles)) {
      if (role !== 'ADMIN') await openDemo();
      const restaurantId = role === 'STOREKEEPER' ? 84 : 42;
      if (restaurantId === 84) {
        await page.getByRole('combobox', { name: 'Тестовый ресторан', exact: true }).click();
        await page.getByRole('option', { name: 'Демо ресторан 84', exact: true }).click();
      }
      await page.evaluate(previousMarker => {
        window.demoStaleMarkers = [];
        window.demoObserver?.disconnect();
        window.demoObserver = new MutationObserver(() => { if (previousMarker && document.body.textContent.includes(previousMarker)) window.demoStaleMarkers.push(previousMarker); });
        window.demoObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
      }, previousMarker);
      holdDish = new Promise(resolve => { releaseDish = resolve; });
      await page.getByRole('button', { name: roles[role], exact: true }).click();
      await page.waitForURL(origin + (role === 'WAITER' ? '/dishes' : role === 'STOREKEEPER' ? '/store' : '/analytics/dashboard'));
      await page.getByText(`Демо ${restaurantId} ${role}`, { exact: true }).waitFor();
      if (role === 'ADMIN' || role === 'MANAGER') await navigate('/dishes');
      if (role !== 'STOREKEEPER') {
        await page.getByRole('status', { name: 'Загрузка блюд' }).waitFor();
        assert.equal(previousMarker ? await page.getByText(previousMarker, { exact: true }).count() : 0, 0);
        releaseDish(); holdDish = null;
      } else { releaseDish(); holdDish = null; }
      const currentMarker = `Данные-${restaurantId}-${role}`;
      await page.getByText(currentMarker, { exact: true }).waitFor();
      assert.deepEqual(await page.evaluate(() => window.demoStaleMarkers), []);
      await page.evaluate(() => window.demoObserver.disconnect());
      assert.equal(actor.role, role);
      assert.equal(actor.restaurantId, restaurantId);
      previousMarker = currentMarker;
    }
    assert.deepEqual(errors, []);
    assert.ok(sockets.some(item => item.restaurantId === 84 && item.role === 'STOREKEEPER'));
    console.log('Demo UI passed: isolated create fail/retry preserves current actor; demo list retry; four roles + public guest link; rejected login has no refresh; same SPA browser switches accounts/restaurants, reconnects sockets, and never flashes prior actor dish cache.');
  } catch (error) {
    if (page) await page.screenshot({ path: path.join(os.tmpdir(), 'stoq-demo-smoke-failure.png'), fullPage: true });
    throw error;
  } finally { await browser.close(); await vite.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
