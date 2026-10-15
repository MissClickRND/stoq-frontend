const { chromium } = require(require.resolve("playwright", { paths: [process.argv[2] || process.cwd()] }));
const assert = require("node:assert/strict");
let origin = process.env.INVENTORY_UI_URL;
const oil = { id: 93, supplyId: 53, productId: 79, price: 300, totalPrice: 897,
  availableQuantity: 2.99, Quantity: 2.99, expiresAt: "2027-10-15T10:31:52.788Z", status: "RUNNINGOUT",
  product: { id: 79, name: "Масло растительное", unit: { id: 12, name: "Литр", shortName: "л" } } };
const milk = { ...oil, id: 89, productId: 75, availableQuantity: 12, Quantity: 12, status: "ACTIVE",
  product: { id: 75, name: "Молоко", unit: oil.product.unit } };

(async () => {
  const { createServer } = await import("vite");
  const vite = origin ? null : await createServer({ server: { host: "127.0.0.1", port: 0, watch: null, hmr: false } });
  if (vite) { await vite.listen(); origin = "http://127.0.0.1:" + vite.httpServer.address().port; }
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [], requests = [];
    let stock = [oil, milk], expiring = [], activeSocket, inventoryConnections = 0;
    const httpReads = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (!["fetch", "xhr"].includes(request.resourceType())) return route.continue();
      const url = new URL(request.url());
      const path = url.pathname.replace(/^\/api(?=\/)/, "");
      let data = {};
      if (path.startsWith("/inventory")) { httpReads.push(path); throw new Error("Inventory must use sockets only"); }
      if (path === "/auth/status") data = { authenticated: true, user: { id: 1, fullName: "Администратор", email: "admin@test.local", role: "ADMIN", restaurantId: 7 } };
      else if (["/dishes", "/supplies", "/test/restaurants"].includes(path)) data = [];
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
    await page.getByPlaceholder("Поиск продуктов по названию").fill("масло");
    await page.waitForFunction(() => document.querySelectorAll("tbody tr").length === 1);
    assert.equal(httpReads.length, 0);
    stock = [{ ...oil, availableQuantity: 1.25, Quantity: 1.25, totalPrice: 375 }];
    const expired = { eventId: "expired-75", reason: "EXPIRATION_WRITE_OFF", data: stock,
      notifications: [{ productId: 75, productName: "Молоко", problem: "Истёк срок годности партии, остаток списан",
        message: "Молоко: Истёк срок годности партии, остаток списан.", severity: "warning" }] };
    send("inventory:stockChanged", expired);
    send("inventory:batchExpired", expired);
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
    assert.deepEqual(httpReads, []);
    console.log("Inventory socket UI passed: initial request, decimal snapshots, filtered caches, no HTTP warehouse reads, event deduplication, detail removal, manual write-off notice, dashboard and threshold refresh.");
  } finally { await browser.close(); if (vite) await vite.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
