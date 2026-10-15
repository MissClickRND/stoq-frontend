const { chromium } = require(require.resolve("playwright", { paths: [process.argv[2] || process.cwd()] }));
const assert = require("node:assert/strict");
const origin = process.env.STOCK_UI_URL || "http://127.0.0.1:5180";
const photo = "https://images.test/dish.svg";
const dishes = [
  { id: 1, name: "Омлет", productId: 76, productName: "Яйцо куриное" },
  { id: 2, name: "Салат", productId: 77, productName: "Томаты" },
].map((dish) => ({
  ...dish, description: "Описание", imageURL: photo, salePrice: 100, costPrice: 40,
  category: "Меню", availablePortions: 10,
  recipeItems: [{ id: dish.id, dishId: dish.id, productId: dish.productId, quantity: 1, stock: 10,
    portions: 10, product: { id: dish.productId, name: dish.productName, unit: { id: 1, shortName: "шт." } } }],
}));
const products = [10, 6, 2, 1].map((days, index) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return { id: index + 1, supplyId: 1, productId: index + 1, Quantity: 10,
    availableQuantity: 10, price: 10, totalPrice: 100, expiresAt: expiry.toISOString(),
    status: index === 1 ? "RUNNINGOUT" : "ACTIVE",
    product: { id: index + 1, name: `Продукт ${days}`, unit: { id: 1, shortName: "шт." } } };
});

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    const posts = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("https://images.test/**", (route) => route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="green"/></svg>',
    }));
    await page.route("**/*", (route) => {
      const request = route.request();
      if (!["fetch", "xhr"].includes(request.resourceType())) return route.fallback();
      const url = new URL(request.url());
      let data = {};
      if (url.pathname === "/dishes") data = dishes;
      else if (url.pathname === "/inventory") data = products;
      else if (url.pathname === "/orders" && request.method() === "POST") {
        posts.push(request.postDataJSON());
        return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({
          statusCode: 400, message: "Недостаточно товаров на складе. Товар ID 76: нужно 1, доступно 0",
          products: [{ productId: 76, name: "Яйцо куриное" }],
        }) });
      }
      return route.fulfill({ contentType: "application/json", body: JSON.stringify(data) });
    });
    await page.routeWebSocket(/\/socket\.io\//, (ws) => {
      ws.send('0{"sid":"stock-ui","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}');
      ws.onMessage((message) => {
        if (message.startsWith("40/recommendations,")) return ws.send('40/recommendations,{"sid":"stock-ui"}');
        if (!message.startsWith("42/recommendations,")) return;
        const [event, payload] = JSON.parse(message.slice("42/recommendations,".length));
        const stop = event === "recommendations:getStopList";
        ws.send("42/recommendations," + JSON.stringify([
          stop ? "recommendations:stopListResult" : "recommendations:dishRecommendationsResult",
          { requestId: payload.requestId, data: [{ dishId: 1, dishName: "Омлет", salePrice: 100,
            costPrice: 40, profit: 60, maxPortions: 10, recommendationScore: 1, expiringProducts: [],
            reasons: [{ name: "Яйцо куриное", status: "INSUFFICIENT_STOCK" }], status: "STOP_LIST" }] },
        ]));
      });
    });
    const checkPhoto = async (scope) => {
      const img = scope.getByRole("img", { name: "Омлет", exact: true });
      await img.waitFor();
      await img.evaluate((image) => image.decode());
      assert.equal(await img.getAttribute("src"), photo);
      assert.ok(await img.evaluate((image) => image.naturalWidth > 0));
    };
    for (const mode of ["stop", "recommended"]) {
      await page.goto(`${origin}/dishes?mode=${mode}`);
      await checkPhoto(page.getByRole("table"));
    }
    await page.goto(`${origin}/orders/new`);
    for (const name of ["Омлет", "Салат"]) {
      await page.getByRole("combobox", { name: "Добавить блюдо", exact: true }).fill(name);
      await page.getByRole("option", { name, exact: true }).click();
    }
    await checkPhoto(page);
    await page.getByRole("combobox", { name: "Тип заказа", exact: true }).click();
    await page.getByRole("option", { name: "На вынос", exact: true }).click();
    await page.getByRole("button", { name: "Создать заказ", exact: true }).click();
    const marked = page.locator('[data-unavailable="true"]');
    await marked.filter({ hasText: "Омлет" }).waitFor();
    assert.equal(await marked.count(), 1);
    assert.ok((await marked.textContent()).includes("Яйцо куриное"));
    assert.equal(posts.length, 1);
    assert.equal(posts[0].items.length, 2);

    const base = "/order/new/guest/restaurant-1";
    await page.goto(origin + base);
    for (const name of ["Омлет", "Салат"]) {
      await page.getByRole("article", { name, exact: true }).getByRole("button", { name: "В корзину", exact: true }).click();
    }
    await page.getByRole("link", { name: "Корзина, блюд: 2", exact: true }).click();
    await checkPhoto(page);
    await page.getByRole("combobox", { name: "Тип заказа", exact: true }).click();
    await page.getByRole("option", { name: "На вынос", exact: true }).click();
    await page.getByRole("button", { name: "Оформить заказ", exact: true }).click();
    await marked.filter({ hasText: "Омлет" }).waitFor();
    assert.equal(await marked.count(), 1);
    assert.ok((await marked.textContent()).includes("Яйцо куриное"));
    assert.equal(posts.length, 2);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.getByRole("button", { name: "Удалить из корзины Омлет", exact: true }).click();
    assert.equal(await marked.count(), 0);

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(origin + "/store");
    for (const [days, color] of [[10, "green"], [6, "yellow"], [2, "orange"], [1, "red"]]) {
      const row = page.getByRole("row").filter({ has: page.getByText(`Продукт ${days}`, { exact: true }) });
      const expiry = row.getByText(`${days} ${days === 1 ? "день" : days === 2 ? "дня" : "дней"}`, { exact: true });
      await expiry.waitFor();
      assert.ok((await expiry.getAttribute("style")).includes(color));
      await row.getByText(days === 6 ? "Заканчивается" : "В норме", { exact: true }).waitFor();
    }
    assert.deepEqual(errors, []);
    console.log("Passed: stop-list and recommendation photos; waiter and guest order photos, missing products and selective red rows; mobile cart; independent expiry colors and stock labels.");
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
