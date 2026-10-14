const { chromium } = require(require.resolve("playwright", { paths: [process.argv[2] || process.cwd()] }));
const assert = require("node:assert/strict");

const dishes = [
  { id: 11, name: "Паста Маринара", category: "Паста", description: "", salePrice: 500, availablePortions: 0, costPrice: 220, recipeItems: [] },
  { id: 12, name: "Пицца Маргарита", category: "Пицца", description: "", salePrice: 650, availablePortions: 4, costPrice: 260, recipeItems: [] },
];
const graph = {
  nodes: [
    { id: "product:1", type: "ingredient", data: { name: "Помидоры", quantity: 0, unit: "кг", status: "out_of_stock" } },
    { id: "product:2", type: "ingredient", data: { name: "Базилик", quantity: 0.05, unit: "кг", status: "low_stock" } },
    { id: "product:3", type: "ingredient", data: { name: "Мука", quantity: 12, unit: "кг", status: "available" } },
    { id: "dish:11", type: "dish", data: { name: "Паста Маринара", status: "unavailable" } },
    { id: "dish:12", type: "dish", data: { name: "Пицца Маргарита", status: "available" } },
  ],
  edges: [
    { id: "recipe:1", source: "product:1", target: "dish:11", data: { required: 0.15, unit: "кг", status: "unavailable" } },
    { id: "recipe:2", source: "product:2", target: "dish:11", data: { required: 0.01, unit: "кг", status: "low_stock" } },
    { id: "recipe:3", source: "product:3", target: "dish:12", data: { required: 0.2, unit: "кг", status: "available" } },
  ],
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      if (!["fetch", "xhr"].includes(route.request().resourceType())) return route.continue();
      const pathname = new URL(route.request().url()).pathname;
      const data = pathname === "/dishes" ? dishes : pathname === "/analytics/graph" ? graph : {};
      return route.fulfill({ contentType: "application/json", body: JSON.stringify(data) });
    });

    await page.goto((process.env.DISH_GRAPH_UI_URL || "http://localhost:5173") + "/dishes");
    await page.getByRole("tab", { name: "Граф связей", exact: true }).click();
    const graphView = page.getByRole("complementary", { name: "Выбор блюда для анализа", exact: true });
    await graphView.waitFor();
    await page.getByLabel(/^Блюдо: Паста Маринара/).waitFor();
    assert.equal(await page.locator(".react-flow__node").count(), 3);
    await page.getByText("Вся карта", { exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll(".react-flow__node").length === 5);
    await page.goto((process.env.DISH_GRAPH_UI_URL || "http://localhost:5173") + "/analytics/dependencies");
    await page.waitForURL(/\/dishes\?mode=graph$/);
    await page.getByRole("complementary", { name: "Выбор блюда для анализа", exact: true }).waitFor();
    await page.setViewportSize({ width: 320, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
    assert.deepEqual(errors, []);
    console.log("Dish graph tab passed: navigation, default dish view, full map, redirect, and mobile width.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
