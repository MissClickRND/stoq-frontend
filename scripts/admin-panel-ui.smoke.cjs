const { chromium } = require(require.resolve('playwright', { paths: [process.argv[2] || process.cwd()] }));
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const origin = process.env.ADMIN_UI_URL || 'http://127.0.0.1:5187';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const contexts = [], errors = [];
  async function fixture(admin = false) {
    const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } }); contexts.push(context);
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror', error => errors.push(error.message));
    const state = { failList: false, failAction: false, failSettings: false, failInvitation: false,
      employees: [
        { id: 1, fullName: 'Админ Ресторана', email: 'owner@example.com', role: 'ADMIN', status: 'active', createdAt: '2026-10-15' },
        { id: 9, fullName: 'Новый Сотрудник', email: 'new@example.com', role: 'WAIT_CONFIRM', status: 'pending', createdAt: '2026-10-15' },
      ], invitations: [], restaurant: { id: 7, name: 'Текущее кафе', address: 'Москва, улица 7', email: null, phone: null }, requests: [] };
    await page.route('**/*', async route => {
      const request = route.request();
      if (!['fetch', 'xhr'].includes(request.resourceType())) return route.continue();
      const pathname = new URL(request.url()).pathname.replace(/^\/api(?=\/)/, '');
      const method = request.method(), body = request.postData() ? JSON.parse(request.postData()) : undefined;
      state.requests.push({ path: pathname, method, body });
      let data = [], status = 200;
      if (pathname === '/auth/status') {
        status = admin ? 200 : 401;
        data = { authenticated: admin, user: { id: 1, fullName: 'Админ Ресторана', email: 'owner@example.com', role: 'ADMIN', restaurantId: 7 } };
      } else if (pathname === '/auth/refresh') { status = 401; data = { message: 'Нет сессии' }; }
      else if (pathname === '/restaurants') {
        status = state.failList ? 503 : 200;
        data = state.failList ? { message: 'Список временно недоступен' } : [{ id: 7, name: 'Текущее кафе', address: 'Москва' }, { id: 42, name: 'Второе кафе', address: 'Казань' }];
      } else if (pathname === '/auth/register-user') data = { message: 'Регистрация выполнена', user: { id: 20, email: body.email, restaurantId: body.restaurantId, role: body.invitationId ? 'MANAGER' : 'WAIT_CONFIRM' } };
      else if (pathname === '/auth/admin/users') data = state.employees;
      else if (/^\/auth\/admin\/users\/\d+\//.test(pathname)) {
        if (state.failAction) { status = 503; data = { message: 'Действие временно недоступно' }; }
        else {
          const employee = state.employees.find(item => item.id === Number(pathname.split('/')[4]));
          if (pathname.endsWith('/approve')) { employee.role = body.role; employee.status = 'active'; }
          if (pathname.endsWith('/role')) employee.role = body.role;
          if (pathname.endsWith('/block')) employee.status = body.blocked ? 'blocked' : 'active';
          data = employee;
        }
      } else if (pathname === '/auth/admin/restaurant') {
        if (method === 'PATCH' && state.failSettings) { status = 503; data = { message: 'Настройки не сохранены' }; }
        else { if (method === 'PATCH') Object.assign(state.restaurant, body); data = state.restaurant; }
      } else if (pathname === '/auth/admin/invitations' && method === 'GET') data = state.invitations;
      else if (pathname.startsWith('/auth/admin/invitations')) {
        if (state.failInvitation) { status = 503; data = { message: 'Приглашение не изменено' }; }
        else if (method === 'POST') {
          data = { id: 'server-invitation-uuid', role: body.role, restaurantId: 7, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + body.hours * 3600000).toISOString(), revokedAt: null, usedAt: null };
          state.invitations.push(data);
        } else if (method === 'PATCH') { state.invitations[0].revokedAt = new Date().toISOString(); data = state.invitations[0]; }
        else { state.invitations = []; data = { ok: true }; }
      }
      return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    });
    return { page, state };
  }
  let current;
  try {
    const admin = await fixture(true); current = admin.page;
    const { page, state } = admin;
    await page.goto(origin + '/admin-panel');
    await page.getByRole('row', { name: /Новый Сотрудник/ }).waitFor();
    assert.equal(await page.getByRole('combobox', { name: 'Изменить роль: Админ Ресторана' }).isDisabled(), true);
    for (const title of ['Всего сотрудников', 'Приглашения отправлены', 'Запросили доступ', 'Администраторов']) await page.getByText(title, { exact: true }).waitFor();
    assert.equal(await page.getByRole('tab').count(), 3);
    await page.getByRole('textbox', { name: 'Поиск сотрудника по имени, email или роли' }).fill('Несуществующий');
    await page.getByText('Сотрудники не найдены', { exact: true }).waitFor();
    await page.getByRole('textbox', { name: 'Поиск сотрудника по имени, email или роли' }).fill('');
    await page.getByRole('combobox', { name: 'Изменить роль: Новый Сотрудник' }).click();
    await page.getByRole('option', { name: 'Менеджер', exact: true }).click();
    state.failAction = true;
    await page.getByRole('button', { name: 'Одобрить доступ: Новый Сотрудник' }).click();
    await page.getByRole('alert').filter({ hasText: 'Действие временно недоступно' }).waitFor();
    assert.equal(state.employees[1].status, 'pending');
    state.failAction = false;
    await page.getByRole('button', { name: 'Одобрить доступ: Новый Сотрудник' }).click();
    await page.getByRole('row', { name: /Новый Сотрудник/ }).getByText('Активен', { exact: true }).waitFor();
    assert.equal(state.requests.filter(item => item.path.endsWith('/approve')).at(-1).body.role, 'MANAGER');
    await page.getByRole('combobox', { name: 'Изменить роль: Новый Сотрудник' }).click();
    await page.getByRole('option', { name: 'Администратор', exact: true }).click();
    await page.getByRole('row', { name: /Новый Сотрудник/ }).getByText('Администратор', { exact: true }).waitFor();
    assert.equal(state.requests.filter(item => item.path.endsWith('/role')).at(-1).body.role, 'ADMIN');
    await page.getByRole('button', { name: 'Заблокировать: Новый Сотрудник', exact: true }).click();
    state.failAction = true;
    await page.getByRole('dialog').getByRole('button', { name: 'Заблокировать', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Действие временно недоступно' }).waitFor();
    assert.equal(await page.getByRole('dialog').isVisible(), true);
    state.failAction = false;
    await page.getByRole('dialog').getByRole('button', { name: 'Заблокировать', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await page.getByRole('row', { name: /Новый Сотрудник/ }).getByText('Заблокирован', { exact: true }).waitFor();
    await page.screenshot({ path: path.join(os.tmpdir(), 'stoq-admin-employees.png'), fullPage: true });

    await page.getByRole('tab', { name: 'Заведение', exact: true }).click();
    const name = page.getByRole('textbox', { name: 'Название ресторана', exact: true });
    assert.equal(await name.inputValue(), 'Текущее кафе');
    assert.equal(await page.getByRole('textbox', { name: 'Email ресторана' }).inputValue(), '');
    await name.fill('Новое кафе'); state.failSettings = true;
    await page.getByRole('button', { name: 'Сохранить изменения', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Настройки не сохранены' }).waitFor();
    assert.equal(await name.inputValue(), 'Новое кафе');
    state.failSettings = false;
    await page.getByRole('button', { name: 'Сохранить изменения', exact: true }).click();
    await page.getByText('Настройки заведения обновлены', { exact: true }).waitFor();
    assert.deepEqual(state.requests.filter(item => item.path === '/auth/admin/restaurant' && item.method === 'PATCH').at(-1).body, { name: 'Новое кафе' });
    assert.equal(state.restaurant.email, null);
    await page.screenshot({ path: path.join(os.tmpdir(), 'stoq-admin-establishment.png'), fullPage: true });

    await page.getByRole('tab', { name: 'Приглашения', exact: true }).click();
    const generated = page.getByRole('textbox', { name: 'Сгенерированная ссылка' });
    await page.getByRole('combobox', { name: 'Роль для приглашения' }).click();
    await page.getByRole('option', { name: 'Администратор', exact: true }).click();
    state.failInvitation = true;
    await page.getByRole('button', { name: 'Создать ссылку', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Приглашение не изменено' }).waitFor();
    assert.equal(await generated.inputValue(), '');
    state.failInvitation = false;
    await page.getByRole('button', { name: 'Создать ссылку', exact: true }).click();
    await page.getByText('Приглашение создано', { exact: true }).waitFor();
    assert.equal(state.requests.filter(item => item.path === '/auth/admin/invitations' && item.method === 'POST').at(-1).body.role, 'ADMIN');
    assert.ok((await generated.inputValue()).includes('restaurantId=7&invitationId=server-invitation-uuid'));
    await page.screenshot({ path: path.join(os.tmpdir(), 'stoq-admin-invitations.png'), fullPage: true });
    await page.getByRole('button', { name: 'Отключить ссылку', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Отключить', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await page.getByText('Отключена', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Удалить приглашение', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Удалить', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await page.getByText('Приглашений пока нет', { exact: true }).waitFor();
    assert.equal(await generated.inputValue(), '');

    const employee = await fixture(); current = employee.page;
    employee.state.failList = true;
    await employee.page.goto(origin + '/register/employee');
    await employee.page.getByRole('alert').filter({ hasText: 'Список временно недоступен' }).waitFor();
    assert.equal(await employee.page.getByRole('button', { name: 'Отправить запрос', exact: true }).isDisabled(), true);
    employee.state.failList = false;
    await employee.page.getByRole('button', { name: 'Повторить', exact: true }).click();
    const establishment = employee.page.getByRole('combobox', { name: 'Заведение', exact: true });
    await establishment.fill('Второе');
    await employee.page.getByRole('option', { name: /Второе кафе/ }).click();
    await employee.page.getByRole('textbox', { name: 'Имя и фамилия' }).fill('Новый Сотрудник');
    await employee.page.getByRole('textbox', { name: 'Почта', exact: true }).fill('new@example.com');
    await employee.page.locator('input[type=password]').fill('1234');
    assert.equal(await establishment.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(255, 255, 255)');
    await employee.page.screenshot({ path: path.join(os.tmpdir(), 'stoq-registration-select.png'), fullPage: true });
    await employee.page.getByRole('button', { name: 'Отправить запрос', exact: true }).click();
    await employee.page.getByRole('heading', { name: 'Ваша заявка получена' }).waitFor();
    assert.deepEqual(employee.state.requests.find(item => item.path === '/auth/register-user').body,
      { fullName: 'Новый Сотрудник', email: 'new@example.com', password: '1234', restaurantId: 42 });

    const invited = await fixture(); current = invited.page;
    await invited.page.goto(origin + '/register/employee?restaurantId=7&invitationId=valid-invitation');
    await invited.page.getByRole('combobox', { name: 'Заведение', exact: true }).waitFor();
    await invited.page.getByRole('textbox', { name: 'Имя и фамилия' }).fill('Новый Сотрудник');
    await invited.page.getByRole('textbox', { name: 'Почта', exact: true }).fill('invited@example.com');
    await invited.page.locator('input[type=password]').fill('1234');
    await invited.page.getByRole('button', { name: 'Отправить запрос', exact: true }).click();
    await invited.page.getByRole('heading', { name: 'Регистрация завершена' }).waitFor();
    assert.equal(invited.state.requests.find(item => item.path === '/auth/register-user').body.invitationId, 'valid-invitation');
    assert.deepEqual(errors, []);
    console.log('Admin/registration UI passed: original tabs/stats/search, approval and blocking with failure retry, prefilled optional settings, invitations lifecycle, searchable public restaurant select, URL invitation preserved, white input style.');
  } catch (error) {
    if (current) await current.screenshot({ path: path.join(os.tmpdir(), 'stoq-admin-smoke-failure.png'), fullPage: true });
    throw error;
  } finally { for (const context of contexts) await context.close(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });


