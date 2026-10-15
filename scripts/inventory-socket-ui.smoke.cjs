const { chromium } = require(require.resolve("playwright", { paths: [process.argv[2] || process.cwd()] }));
const assert = require("node:assert/strict");
const origin = process.env.INVENTORY_UI_URL || "http://127.0.0.1:5180";
const oil = { id: 93, supplyId: 53, productId: 79, price: 300, totalPrice: 897,
  availableQuantity: 2.99, Quantity: 2.99, expiresAt: "2027-10-15T10:31:52.788Z", status: "RUNNINGOUT",
  product: { id: 79, name: "Масло растительное", unit: { id: 12, name: "Литр", shortName: "л" } } };
const milk = { ...oil, id: 89, productId: 75, availableQuantity: 12, Quantity: 12, status: "ACTIVE",
  product: { id: 75, name: "Молоко", unit: oil.product.unit } };

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [], requests = [];
    let stock = [oil, milk], expiring = [], activeSocket, inventoryConnections = 0;
    let holdSearch = false, releaseSearch;
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (!["fetch", "xhr"].includes(request.resourceType())) return route.continue();
      const url = new URL(request.url());
      let data = {};
      if (url.pathname === "/inventory") {
        const search = url.searchParams.get("search") || "";
        data = stock.filter((batch) => batch.product.name.toLowerCase().includes(search.toLowerCase()));
        if (holdSearch && search) {
          await new Promise((resolve) => { releaseSearch = resolve; });
        }
      } else if (url.pathname === "/inventory/expiring") data = expiring;
      else if (["/dishes", "/supplies"].includes(url.pathname)) data = [];
      return route.fulfill({ contentType: "application/json", body: JSON.stringify(data) });
    });
    await page.routeWebSocket(/\/socket\.io\//, (ws) => {
      ws.send('0{"sid":"inventory-test","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}');
      ws.onMessage((message) => {
        if (message.startsWith("40/inventory,")) {
          inventoryConnections++;
          activeSocket = ws;
          return ws.send('40/inventory,{"sid":"inventory-test"}');
        }
        if (!message.startsWith("42/inventory,")) return;
        const [event, payload] = JSON.parse(message.slice("42/inventory,".length));
        requests.push({ event, payload });
        const result = event === "inventory:getStock" ? "inventory:stockResult" : "inventory:expiringSoonResult";
        ws.send("42/inventory," + JSON.stringify([result, { requestId: payload.requestId,
          data: event === "inventory:getStock" ? stock : expiring }]));
      });
    });
    const send = (event, payload) => activeSocket.send("42/inventory," + JSON.stringify([event, payload]));
    const row = (name) => page.getByRole("row").filter({ has: page.getByText(name, { exact: true }) });
    await page.goto(origin + "/store");
    await row("Масло растительное").waitFor();
    await page.waitForFunction(() => document.querySelectorAll("tbody tr").length === 2);
    assert.deepEqual(requests.find((request) => request.event === "inventory:getStock").payload, { requestId: "store" });
    const connectionCount = inventoryConnections;
    holdSearch = true;
    await page.getByPlaceholder("Поиск продуктов по названию").fill("масло");
    await page.waitForResponse(() => false, { timeout: 400 }).catch(() => {});
    assert.equal(typeof releaseSearch, "function");
    stock = [{ ...oil, availableQuantity: 1.25, Quantity: 1.25, totalPrice: 375 }];
    const expired = { eventId: "expired-75", reason: "EXPIRATION_WRITE_OFF", data: stock,
      notifications: [{ productId: 75, productName: "Молоко", problem: "Истёк срок годности партии, остаток списан",
        message: "Молоко: Истёк срок годности партии, остаток списан.", severity: "warning" }] };
    send("inventory:stockChanged", expired);
    send("inventory:batchExpired", expired);
    releaseSearch(); holdSearch = false;
    await row("Масло растительное").getByText("1,25", { exact: true }).waitFor();
    assert.equal(await row("Молоко").count(), 0);
    assert.equal(await page.getByText(expired.notifications[0].message, { exact: true }).count(), 1);
    await page.getByPlaceholder("Поиск продуктов по названию").fill("");
    await row("Масло растительное").getByText("1,25", { exact: true }).waitFor();
    await row("Масло растительное").getByRole("link", { name: "Подробнее", exact: true }).click();
    await page.getByRole("heading", { name: "Масло растительное", exact: true }).waitFor();
    stock = [];
    send("inventory:stockChanged", { eventId: "manual-93", reason: "MANUAL_WRITE_OFF", data: [], message: "Масло: остаток списан вручную." });
    await page.getByRole("heading", { name: "Запись не найдена", exact: true }).waitFor();
    await page.getByText("Масло: остаток списан вручную.", { exact: true }).waitFor();
    assert.equal(inventoryConnections, connectionCount, "Route navigation must reuse the inventory connection");

    await page.goto(origin + "/analytics/dashboard");
    await page.getByRole("heading", { name: "Скоро испортятся", exact: true }).waitFor();
    await page.getByText("Нет партий с истекающим сроком годности в течение 7 дн.", { exact: true }).waitFor();
    const expiry = new Date(); expiry.setDate(expiry.getDate() + 2);
    expiring = [{ batchId: 93, productId: 79, product: oil.product, expiresAt: expiry.toISOString(),
      daysRemaining: 2, availableQuantity: 0.5, price: "300" }];
    stock = [{ ...oil, expiresAt: expiry.toISOString(), availableQuantity: 0.5, Quantity: 0.5 }];
    send("inventory:stockChanged", { eventId: "supply-93", reason: "SUPPLY_RECEIVED", data: stock });
    const section = page.getByRole("region", { name: "Продукты с истекающим сроком годности", exact: true });
    await section.getByText("Масло растительное", { exact: true }).waitFor();
    await section.getByText("0,5 л", { exact: true }).waitFor();
    await page.getByRole("combobox", { name: "Порог срока годности", exact: true }).click();
    await page.getByRole("option", { name: "14 дней", exact: true }).click();
    await section.getByText("Масло растительное", { exact: true }).waitFor();
    assert.ok(requests.some((request) => request.event === "inventory:getExpiringSoon" && request.payload.daysThreshold === 14));
    assert.deepEqual(errors, []);
    console.log("Inventory socket UI passed: initial request, decimal snapshots, filtered caches, old HTTP response race, event deduplication, detail removal, manual write-off notice, dashboard and threshold refresh.");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
