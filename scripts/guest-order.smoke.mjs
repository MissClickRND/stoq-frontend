import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const { chromium } = require(require.resolve('playwright', { paths: [process.argv[2] || process.cwd()] }));
const vite = await createServer({ server: { host: '127.0.0.1', port: 0, watch: null, hmr: false } });
let browser;
let page;
const requests = [];
const failures = [];
try {
  await vite.listen();
  const origin = 'http://127.0.0.1:' + vite.httpServer.address().port;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies([{ name: 'accessToken', value: 'staff-other-restaurant', url: origin }]);
  page = await context.newPage();
  page.on('pageerror', error => failures.push(error.message));
  await page.route(origin + '/api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const headers = await request.allHeaders();
    const body = request.method() === 'POST' ? request.postDataJSON() : undefined;
    requests.push({ path, method: request.method(), restaurant: headers['x-restaurant-id'], cookie: headers.cookie, body });
    let data;
    if (path === '/api/restaurants') data = [{ id: 7, name: 'Тестовый ресторан семь', address: 'Москва' }, { id: 8, name: 'Тестовый ресторан восемь', address: 'Казань' }];
    else if (path === '/api/menu') {
      data = [{ id: 71, name: headers['x-restaurant-id'] === '7' ? 'Суп ресторана семь' : 'Салат ресторана восемь',
        category: null, salePrice: 300, available: true, description: 'Описание блюда гостевого меню',
        imageURL: `${origin}/guest-dish.jpg`, recommended: headers['x-restaurant-id'] === '7',
        recommendationRank: headers['x-restaurant-id'] === '7' ? 1 : null }];
    } else if (path === '/api/orders' && request.method() === 'POST') {
      data = { ...body, id: 55, status: 'created', totalPrice: 325,
        items: [{ dishId: 71, quantity: 1, name: 'Суп ресторана семь', price: 325, totalPrice: 325 }] };
    } else {
      failures.push(`Unexpected API request ${request.method()} ${path}`);
      await route.fulfill({ status: 403, json: { message: 'Unexpected protected request' } });
      return;
    }
    await route.fulfill({ json: data });
  });
  await page.route(origin + '/guest-dish.jpg', route => route.fulfill({
    contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="green"/></svg>',
  }));
  await page.goto(origin + '/order/new/guest/7');
  await page.getByText('Тестовый ресторан семь', { exact: true }).waitFor();
  const card = page.getByRole('article', { name: 'Суп ресторана семь' });
  await card.getByText('Советуем', { exact: true }).waitFor();
  const photo = card.getByRole('img', { name: 'Суп ресторана семь' });
  assert.equal(await photo.getAttribute('src'), origin + '/guest-dish.jpg');
  await photo.evaluate(image => image.decode());
  await card.getByRole('link', { name: 'Подробнее', exact: true }).click();
  await page.getByRole('heading', { name: 'Суп ресторана семь' }).waitFor();
  await page.getByText('Советуем', { exact: true }).waitFor();
  await page.getByText('Описание блюда гостевого меню', { exact: true }).waitFor();
  const detailPhoto = page.getByRole('img', { name: 'Суп ресторана семь' });
  assert.equal(await detailPhoto.getAttribute('src'), origin + '/guest-dish.jpg');
  await detailPhoto.evaluate(image => image.decode());
  await page.getByRole('link', { name: 'Меню', exact: true }).first().click();
  await page.getByRole('button', { name: 'В корзину', exact: true }).click();
  await page.getByRole('link', { name: 'Корзина, блюд: 1' }).click();
  await page.getByRole('combobox', { name: 'Тип заказа' }).click();
  await page.getByRole('option', { name: 'На вынос' }).click();
  await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();
  await page.getByRole('heading', { name: 'Заказ сформирован' }).waitFor();
  assert.match(await page.locator('main').innerText(), /325/);
  await page.reload();
  await page.getByRole('heading', { name: 'Заказ сформирован' }).waitFor();
  await page.goto(origin + '/order/new/guest/8/complete?orderId=55');
  await page.getByText('Тестовый ресторан восемь', { exact: true }).waitFor();
  assert.match(await page.locator('main').innerText(), /Подробности заказа доступны сразу после оформления/);
  assert.doesNotMatch(await page.locator('main').innerText(), /Заказ №55/);
  await page.getByRole('link', { name: 'Вернуться в меню' }).click();
  await page.getByRole('article', { name: 'Салат ресторана восемь' }).waitFor();
  assert.equal(await page.getByText('Советуем', { exact: true }).count(), 0);
  assert.equal(await page.getByRole('article', { name: 'Суп ресторана семь' }).count(), 0);
  await page.getByRole('link', { name: 'Корзина, блюд: 0' }).click();
  await page.getByText('Корзина пока пуста', { exact: true }).waitFor();
  await page.goto(origin + '/order/new/guest/999');
  await page.getByRole('heading', { name: 'Ресторан не найден' }).waitFor();
  assert.deepEqual(failures, []);
  assert.ok(requests.every(request => !request.cookie), 'Guests must omit staff cookies');
  assert.ok(requests.filter(request => request.path === '/api/menu').every(request => ['7', '8'].includes(request.restaurant)));
  const order = requests.find(request => request.path === '/api/orders');
  assert.equal(order.restaurant, '7');
  assert.deepEqual(order.body.items, [{ dishId: 71, quantity: 1 }]);
  assert.equal('restaurantId' in order.body, false);
  assert.equal('totalPrice' in order.body, false);
  assert.equal(requests.filter(request => request.path === '/api/orders').length, 1);
  console.log('Guest browser smoke passed: photos and recommendation badges in cards/details, URL restaurant scope, cookie omission, checkout, server receipt, reload and cross-restaurant isolation.');
} catch (error) {
  console.error({ requests, failures, page: await page?.locator('body').innerText().catch(() => '') });
  throw error;
} finally {
  await browser?.close();
  await vite.close();
}
