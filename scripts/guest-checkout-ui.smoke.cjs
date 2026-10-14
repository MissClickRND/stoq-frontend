const { chromium } = require(
  require.resolve("playwright", { paths: [process.argv[2] || process.cwd()] }),
);
const assert = require("node:assert/strict");
const base = "/order/new/guest/restaurant-1";
const dishes = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Блюдо ${String(i + 1).padStart(2, "0")}`,
  description: "Описание",
  salePrice: 100,
  category: "Меню",
  availablePortions: 10,
  costPrice: 40,
  recipeItems: [],
}));
const recommendations = Array.from({ length: 14 }, (_, i) => ({
  dishId: 20 - i,
  dishName: dishes[19 - i].name,
  salePrice: 100,
  costPrice: 40,
  profit: 60,
  maxPortions: 10,
  expiringProducts: [],
  recommendationScore: 1 - i / 20,
}));

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    const pageErrors = [];
    const posts = [];
    let savedOrder;
    let failRecommendations = false;
    let holdCreate;
    let requestedCreate;
    const createRequested = new Promise((resolve) => {
      requestedCreate = resolve;
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (!["fetch", "xhr"].includes(request.resourceType()))
        return route.continue();
      const url = new URL(request.url());
      let data = {};
      if (url.pathname === "/dishes") {
        const search = (url.searchParams.get("search") || "").toLowerCase();
        data = dishes.filter((dish) =>
          dish.name.toLowerCase().includes(search),
        );
      } else if (url.pathname === "/orders" && request.method() === "POST") {
        const body = request.postDataJSON();
        posts.push(body);
        if (posts.length === 1) {
          return route.fulfill({
            status: 409,
            contentType: "application/json",
            body: JSON.stringify({
              message: "Недостаточно ингредиентов. Повторите заказ.",
            }),
          });
        }
        if (posts.length === 2)
          await new Promise((resolve) => {
            holdCreate = resolve;
            requestedCreate();
          });
        savedOrder = {
          id: 729 + posts.length,
          ...body,
          status: "created",
          totalPrice: 175,
          items: body.items.map((item) => ({
            ...item,
            name: dishes[item.dishId - 1].name,
            price: 87.5,
            totalPrice: 175,
          })),
        };
        data = savedOrder;
      } else if (url.pathname === `/orders/${savedOrder?.id}`)
        data = savedOrder;
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(data),
      });
    });
    await page.routeWebSocket(/\/socket\.io\//, (ws) => {
      ws.send(
        '0{"sid":"guest","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}',
      );
      ws.onMessage((message) => {
        if (message.startsWith("40/recommendations,")) {
          ws.send('40/recommendations,{"sid":"guest-recommendations"}');
        } else if (message.startsWith("42/recommendations,")) {
          const [event, payload] = JSON.parse(
            message.slice("42/recommendations,".length),
          );
          assert.equal(event, "recommendations:getDishRecommendations");
          assert.deepEqual(payload, { requestId: "recommendedListId" });
          if (failRecommendations) {
            ws.send(
              "42/recommendations," +
                JSON.stringify([
                  "recommendations:error",
                  {
                    requestId: payload.requestId,
                    message: "Recommendations unavailable",
                  },
                ]),
            );
            return;
          }
          ws.send(
            "42/recommendations," +
              JSON.stringify([
                "recommendations:dishRecommendationsResult",
                { requestId: payload.requestId, data: recommendations },
              ]),
          );
        }
      });
    });
    const url = process.env.GUEST_UI_URL || "http://localhost:5173";
    await page.goto(url + base);
    await page
      .getByRole("article", { name: "Блюдо 20", exact: true })
      .waitFor();
    const names = () =>
      page
        .getByRole("article")
        .evaluateAll((cards) =>
          cards.map((card) => card.getAttribute("aria-label")),
        );
    assert.deepEqual(await names(), [
      ...Array.from({ length: 10 }, (_, i) => `Блюдо ${20 - i}`),
      "Блюдо 01",
      "Блюдо 02",
    ]);
    await page.getByRole("button", { name: "Страница 2", exact: true }).click();
    assert.equal((await names()).length, 12);
    await page.getByRole("button", { name: "Страница 3", exact: true }).click();
    assert.deepEqual(await names(), ["Блюдо 25"]);
    await page
      .getByRole("textbox", { name: "Поиск блюд в гостевом меню", exact: true })
      .fill("Блюдо 23");
    await page.getByText("Показано 1–1 из 1 блюд", { exact: true }).waitFor();
    assert.deepEqual(await names(), ["Блюдо 23"]);
    await page
      .getByRole("textbox", { name: "Поиск блюд в гостевом меню", exact: true })
      .fill("");
    await page
      .getByRole("article", { name: "Блюдо 20", exact: true })
      .waitFor();
    await page
      .getByRole("article", { name: "Блюдо 20", exact: true })
      .getByRole("button", { name: "В корзину", exact: true })
      .click();
    await page
      .getByRole("article", { name: "Блюдо 20", exact: true })
      .getByRole("button", { name: "Добавить ещё", exact: true })
      .click();
    await page
      .getByRole("link", { name: "Корзина, блюд: 2", exact: true })
      .click();
    const submit = page.getByRole("button", {
      name: "Оформить заказ",
      exact: true,
    });
    await submit.click();
    await page.getByRole("alert").waitFor();
    assert.equal(
      posts.length,
      0,
      "Missing table is rejected before API submission",
    );
    await page.getByRole("combobox", { name: "Стол", exact: true }).click();
    await page.getByRole("option", { name: "Стол 3", exact: true }).click();
    await page.getByLabel(/^Количество гостей/).fill("2");
    await submit.click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Недостаточно ингредиентов" })
      .waitFor();
    assert.ok(page.url().endsWith("/cart"));
    assert.equal(
      await page
        .getByLabel("Количество Блюдо 20", { exact: true })
        .textContent(),
      "2",
    );
    await submit.click();
    await createRequested;
    assert.ok(await submit.isDisabled());
    await submit.evaluate((button) => button.form.requestSubmit());
    assert.ok(
      await page
        .getByRole("button", {
          name: "Увеличить количество Блюдо 20",
          exact: true,
        })
        .isDisabled(),
    );
    assert.equal(posts.length, 2);
    assert.deepEqual(posts[1].items, [{ dishId: 20, quantity: 2 }]);
    assert.deepEqual(Object.keys(posts[1]).sort(), [
      "date",
      "guests",
      "items",
      "table",
      "type",
    ]);
    assert.equal(posts[1].table, 3);
    assert.equal(posts[1].guests, 2);
    assert.equal(posts[1].type, "dine-in");
    assert.ok(Number.isFinite(Date.parse(posts[1].date)));
    holdCreate();
    await page.waitForURL(/\/complete\?orderId=731$/);
    await page
      .getByText("Заказ №731 принят рестораном.", { exact: true })
      .waitFor();
    await page
      .getByRole("link", { name: "Корзина, блюд: 0", exact: true })
      .waitFor();
    await page.getByText(/175/).waitFor();
    await page.reload();
    await page
      .getByText("Заказ №731 принят рестораном.", { exact: true })
      .waitFor();
    await page.goto(url + base + "/complete");
    await page
      .getByText("Заказ не найден. Оформите заказ из корзины.", { exact: true })
      .waitFor();
    await page
      .getByRole("link", { name: "Вернуться в меню", exact: true })
      .click();
    await page
      .getByRole("article", { name: "Блюдо 20", exact: true })
      .getByRole("button", { name: "В корзину", exact: true })
      .click();
    await page
      .getByRole("link", { name: "Корзина, блюд: 1", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Тип заказа", exact: true })
      .click();
    await page.getByRole("option", { name: "На вынос", exact: true }).click();
    assert.ok(
      await page
        .getByRole("combobox", { name: "Стол", exact: true })
        .isDisabled(),
    );
    await page
      .getByRole("button", { name: "Оформить заказ", exact: true })
      .click();
    await page.waitForURL(/\/complete\?orderId=732$/);
    assert.equal(posts[2].type, "takeaway");
    assert.equal(posts[2].table, null);
    failRecommendations = true;
    await page.goto(url + base);
    await page
      .getByRole("alert")
      .filter({ hasText: "Показываем обычное меню" })
      .waitFor();
    assert.deepEqual(
      await names(),
      Array.from(
        { length: 12 },
        (_, i) => `Блюдо ${String(i + 1).padStart(2, "0")}`,
      ),
    );
    assert.deepEqual(pageErrors, []);
    console.log(
      "Guest menu and checkout passed: top 10 recommendations, 12-item pages, search, validation, failed POST keeps cart, server total, success clears cart, reload uses order ID.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
