const { chromium } = require(require.resolve("playwright", { paths: [process.argv[2] || process.cwd()] }));
const assert = require("node:assert/strict");
const origin = process.env.AUTH_UI_URL || "http://127.0.0.1:5182";
(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const contexts = [];
  const fixture = async (role = null) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    contexts.push(context);
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    let activeRole = role, pending = [{ id: 9, fullName: "Новый Сотрудник", email: "new@example.com", createdAt: "2026-10-15T10:00:00Z" }];
    const requests = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/*", async route => {
      const request = route.request(), url = new URL(request.url());
      if (!["fetch", "xhr"].includes(request.resourceType())) return route.continue();
      const body = request.postData() ? JSON.parse(request.postData()) : undefined;
      requests.push({ path: url.pathname, method: request.method(), body });
      let status = 200, data = [];
      const user = { id: 1, email: "user@example.com", fullName: "Иван Петров", role: activeRole, restaurantId: 7 };
      if (url.pathname === "/auth/status") { status = activeRole ? 200 : 401; data = { authenticated: true, user }; }
      else if (url.pathname === "/auth/refresh") { status = 401; data = { message: "Сессия истекла" }; }
      else if (url.pathname === "/auth/login") {
        if (body.password === "wrong") { status = 400; data = { message: "Неверный email или пароль" }; }
        else { activeRole = "WAITER"; data = { user: { ...user, role: activeRole } }; }
      } else if (url.pathname === "/auth/logout") { activeRole = null; data = { ok: true }; }
      else if (url.pathname === "/auth/register-user") data = { message: "Регистрация отправлена на подтверждение", user: { ...user, role: "WAIT_CONFIRM" } };
      else if (url.pathname === "/auth/register-restaurant") data = { message: "Ресторан создан", user, restaurant: { id: 7, name: body.restaurantName } };
      else if (url.pathname === "/auth/admin/users/pending") data = pending;
      else if (url.pathname.endsWith("/approve")) { pending = []; data = { id: 9, role: body.role }; }
      else if (url.pathname === "/auth/admin/restaurant") data = { id: 7, address: "", ...body };
      else if (url.pathname === "/menu") data = [{ id: 3, name: "Суп", category: "Обед", salePrice: 100, available: true }];
      else if (url.pathname === "/orders" && request.method() === "POST") data = { id: 55, ...body, status: "created", totalPrice: 100, items: [{ dishId: 3, quantity: 1, price: 100, name: "Суп" }] };
      else if (url.pathname.startsWith("/statistics")) data = { total: 0, active: 0, stopped: 0, revenue: 0 };
      return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(data) });
    });
    await page.routeWebSocket(/\/socket\.io\//, ws => {
      ws.send('0{"sid":"auth-test","upgrades":[],"pingInterval":25000,"pingTimeout":20000}');
      ws.onMessage(message => {
        if (message.startsWith("40/")) return ws.send(message.split(",")[0] + ',{"sid":"auth-test"}');
        if (!message.startsWith("42/")) return;
        const comma = message.indexOf(","), ns = message.slice(2, comma);
        const [event, payload] = JSON.parse(message.slice(comma + 1));
        const result = { "inventory:getStock": "inventory:stockResult", "inventory:getExpiringSoon": "inventory:expiringSoonResult",
          "recommendations:getStopList": "recommendations:stopListResult", "recommendations:getDishRecommendations": "recommendations:dishRecommendationsResult" }[event];
        if (result) ws.send("42" + ns + "," + JSON.stringify([result, { ...payload, data: [] }]));
      });
    });
    return { page, requests };
  };
  try {
    const anon = await fixture();
    await anon.page.goto(origin + "/store");
    await anon.page.waitForURL("**/login");
    assert.equal(anon.requests.filter(r => r.path === "/inventory").length, 0);
    await anon.page.getByRole("textbox", { name: "Почта", exact: true }).fill("waiter@example.com");
    await anon.page.getByRole("textbox", { name: "Пароль", exact: true }).fill("wrong");
    await anon.page.getByRole("button", { name: "Войти", exact: true }).click();
    await anon.page.getByRole("alert").filter({ hasText: "Неверный email" }).waitFor();
    await anon.page.getByRole("textbox", { name: "Пароль", exact: true }).fill("1234");
    await anon.page.getByRole("button", { name: "Войти", exact: true }).click();
    await anon.page.waitForURL("**/store");
    await anon.page.getByRole("heading", { name: "Склад", exact: true }).waitFor();
    await anon.page.getByRole("button", { name: "Выйти", exact: true }).click();
    await anon.page.waitForURL("**/login");
    assert.ok(anon.requests.some(r => r.path === "/auth/logout"));

    for (const role of ["ADMIN", "MANAGER", "WAITER", "STOREKEEPER"]) {
      const { page, requests } = await fixture(role);
      await page.goto(origin + "/supply");
      await page.getByRole("heading", { name: "Поставки", exact: true }).waitFor();
      const navigation = page.getByLabel("Основная навигация");
      const text = await navigation.innerText();
      assert.equal(text.includes("Админ-панель"), role === "ADMIN");
      assert.equal(text.includes("Заказы"), ["ADMIN", "MANAGER"].includes(role));
      assert.equal(text.includes("Блюда"), role !== "STOREKEEPER");
      await page.goto(origin + "/admin-panel");
      if (role === "ADMIN") {
        await page.getByRole("heading", { name: "Админ-панель", exact: true }).waitFor();
        await page.getByRole("combobox", { name: "Роль для Новый Сотрудник" }).click();
        await page.getByRole("option", { name: "Менеджер", exact: true }).click();
        await page.getByRole("button", { name: "Подтвердить", exact: true }).click();
        await page.getByRole("status").filter({ hasText: "Сотрудник подтверждён" }).waitFor();
        assert.deepEqual(requests.find(r => r.path.endsWith("/approve")).body, { role: "MANAGER" });
        await page.getByRole("tab", { name: "Заведение", exact: true }).click();
        await page.getByRole("textbox", { name: "Название ресторана", exact: true }).fill("Новое кафе");
        await page.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
        await page.getByRole("status").filter({ hasText: "Сохранено: Новое кафе" }).waitFor();
      } else {
        await page.waitForURL(new RegExp(role === "MANAGER" ? "/analytics/dashboard$" : role === "WAITER" ? "/dishes$" : "/store$"));
        assert.equal(requests.filter(r => r.path === "/auth/admin/users/pending").length, 0);
      }
    }
    const employee = await fixture();
    await employee.page.goto(origin + "/register/employee?restaurantId=7");
    const employeeCard = await employee.page.locator("[data-auth-card]").boundingBox();
    assert.ok(employeeCard.width >= 1200, "Employee registration uses the wide auth layout on desktop");
    await employee.page.getByRole("textbox", { name: "Имя и фамилия" }).fill("Новый Сотрудник");
    await employee.page.getByRole("textbox", { name: "Почта" }).fill("new@example.com");
    await employee.page.getByRole("textbox", { name: "Пароль", exact: true }).fill("1234");
    await employee.page.getByRole("button", { name: "Отправить запрос", exact: true }).click();
    await employee.page.getByRole("heading", { name: "Ваша заявка получена" }).waitFor();
    assert.deepEqual(employee.requests.find(r => r.path === "/auth/register-user").body,
      { fullName: "Новый Сотрудник", email: "new@example.com", password: "1234", restaurantId: 7 });

    const restaurant = await fixture();
    await restaurant.page.goto(origin + "/register/restaurant");
    const restaurantCard = await restaurant.page.locator("[data-auth-card]").boundingBox();
    assert.ok(restaurantCard.width >= 1200, "Restaurant registration uses the wide auth layout on desktop");
    await restaurant.page.getByLabel("Имя и фамилия администратора").fill("Админ Ресторана");
    await restaurant.page.getByLabel("Название заведения").fill("Кафе");
    await restaurant.page.getByLabel("Адрес ресторана").fill("Москва");
    await restaurant.page.getByRole("textbox", { name: "Почта" }).fill("owner@example.com");
    await restaurant.page.getByRole("textbox", { name: "Пароль", exact: true }).fill("1234");
    await restaurant.page.getByRole("button", { name: "Создать ресторан", exact: true }).click();
    await restaurant.page.getByRole("heading", { name: "Ресторан создан", exact: true }).waitFor();

    const guest = await fixture();
    await guest.page.goto(origin + "/order/new/guest/7");
    await guest.page.getByRole("article", { name: "Суп", exact: true }).getByRole("button", { name: "В корзину", exact: true }).click();
    await guest.page.getByRole("link", { name: "Корзина, блюд: 1", exact: true }).click();
    await guest.page.getByRole("combobox", { name: "Тип заказа", exact: true }).click();
    await guest.page.getByRole("option", { name: "На вынос", exact: true }).click();
    await guest.page.getByRole("button", { name: "Оформить заказ", exact: true }).click();
    await guest.page.waitForURL("**/complete?orderId=55");
    await guest.page.getByText("Заказ №55 принят рестораном.", { exact: true }).waitFor();
    await guest.page.reload();
    await guest.page.getByText("Заказ №55 принят рестораном.", { exact: true }).waitFor();
    assert.equal(guest.requests.filter(r => r.path.startsWith("/auth") || r.path.startsWith("/dishes") || r.path.startsWith("/recommendations")).length, 0);
    assert.deepEqual(errors, []);
    console.log("Auth UI passed: login/errors/logout, four role navigation policies, forbidden direct URLs, employee and restaurant registration, admin approval/settings, anonymous guest checkout.");
  } finally { for (const context of contexts) await context.close(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
