const { chromium } = require(
  require.resolve("playwright", { paths: [process.argv[2] || process.cwd()] }),
);
const assert = require("node:assert/strict");

const stopped = {
  dishId: 11,
  dishName: "Пицца в стоп-листе",
  salePrice: 500,
  status: "STOP_LIST",
  maxPortions: 0,
  priority: 0,
  reasons: [{ status: "INSUFFICIENT_STOCK", name: "Сыр" }],
};
const recommended = {
  dishId: 12,
  dishName: "Рекомендуемая паста",
  salePrice: 600,
  costPrice: 200,
  profit: 400,
  maxPortions: 5,
  expiringProducts: ["Моцарелла"],
  recommendationScore: 0.85,
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    const requests = [];
    const httpCollections = [];
    let activeSocket;
    let resultCount = 0;
    let recommendationCount = 0;
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      if (!["fetch", "xhr"].includes(route.request().resourceType()))
        return route.continue();
      const pathname = new URL(route.request().url()).pathname;
      if (
        pathname === "/recommendations" ||
        pathname === "/recommendations/dishes"
      )
        httpCollections.push(pathname);
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(pathname === "/dishes" ? [] : {}),
      });
    });
    // Emulate the Engine.IO handshake and the Socket.IO namespace protocol.
    await page.routeWebSocket(/\/socket\.io\//, (ws) => {
      ws.send(
        '0{"sid":"test","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}',
      );
      ws.onMessage((message) => {
        if (message.startsWith("40/recommendations,")) {
          activeSocket = ws;
          ws.send('40/recommendations,{"sid":"recommendations"}');
          return;
        }
        if (!message.startsWith("42/recommendations,")) return;
        const [event, payload] = JSON.parse(
          message.slice("42/recommendations,".length),
        );
        requests.push({ event, payload });
        const result =
          event === "recommendations:getStopList"
            ? "recommendations:stopListResult"
            : "recommendations:dishRecommendationsResult";
        if (payload.search === "ошибка") {
          ws.send(
            "42/recommendations," +
              JSON.stringify([
                "recommendations:error",
                {
                  requestId: payload.requestId,
                  message: "Тестовая ошибка сервера",
                },
              ]),
          );
          return;
        }
        const data =
          event === "recommendations:getStopList"
            ? payload.search && !"пицца".includes(payload.search.toLowerCase())
              ? []
              : [
                  {
                    ...stopped,
                    dishName: `${stopped.dishName} ${++resultCount}`,
                  },
                ]
            : [
                {
                  ...recommended,
                  dishName: `${recommended.dishName} ${++recommendationCount}`,
                },
              ];
        ws.send(
          "42/recommendations," +
            JSON.stringify([result, { requestId: payload.requestId, data }]),
        );
      });
    });

    await page.goto(
      (process.env.RECOMMENDATION_UI_URL || "http://localhost:5173") +
        "/dishes?mode=stop",
    );
    await page.getByRole("cell", { name: /Пицца в стоп-листе/ }).waitFor();
    const search = page.getByPlaceholder("Поиск блюд по названию");
    await search.fill("пицца");
    await page.getByRole("cell", { name: /Пицца в стоп-листе 2/ }).waitFor();
    assert.deepEqual(requests.at(-1), {
      event: "recommendations:getStopList",
      payload: { requestId: "stopListId", search: "пицца" },
    });
    activeSocket.send(
      '42/recommendations,["recommendations:stopListUpdated",{}]',
    );
    await page.getByRole("cell", { name: /Пицца в стоп-листе 3/ }).waitFor();
    assert.equal(requests.at(-1).payload.search, "пицца");
    await search.fill("ошибка");
    await page
      .getByRole("alert")
      .filter({ hasText: "Тестовая ошибка сервера" })
      .waitFor();
    await search.fill("несуществующее");
    await page.getByText("В стоп-листе нет блюд", { exact: true }).waitFor();
    await page
      .getByRole("tab", { name: "Горячие предложения", exact: true })
      .click();
    await page.getByRole("cell", { name: /Рекомендуемая паста/ }).waitFor();
    await page.getByText(/Прибыль с порции: 400/).waitFor();
    assert.deepEqual(requests.at(-1), {
      event: "recommendations:getDishRecommendations",
      payload: { requestId: "recommendedListId" },
    });
    const beforeRefresh = requests.length;
    activeSocket.send(
      '42/recommendations,["recommendations:stopListUpdated",{}]',
    );
    await page.getByRole("cell", { name: /Рекомендуемая паста 2/ }).waitFor();
    assert.ok(requests.length > beforeRefresh);
    await page.getByRole("tab", { name: "Все блюда", exact: true }).click();
    await page.getByText("Блюда не найдены", { exact: true }).waitFor();
    assert.deepEqual(httpCollections, []);
    assert.deepEqual(errors, []);
    console.log(
      "Socket tables passed: rendering, search, broadcasts, errors, empty state, tab navigation; no HTTP collection requests.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
