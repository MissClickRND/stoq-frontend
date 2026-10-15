import { test } from "node:test";
import assert from "node:assert/strict";
import { createInventorySubscription } from "../src/entities/store/api/inventory-socket.ts";

class TestSocket {
  connected = false;
  listeners = new Map();
  sent = [];
  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
  }
  off(event, handler) { this.listeners.get(event)?.delete(handler); }
  emit(event, payload) { this.sent.push({ event, payload }); }
  connect() {}
  receive(event, payload) { for (const handler of this.listeners.get(event) ?? []) handler(payload); }
  open() { this.connected = true; this.receive("connect"); }
  disconnect() { this.connected = false; this.receive("disconnect"); }
}
const batch = { id: 93, supplyId: 53, productId: 79, availableQuantity: 2.99, Quantity: 2.99,
  status: "RUNNINGOUT", expiresAt: "2027-10-15T10:31:52.788Z", product: { id: 79, name: "Масло" } };

function setup(t) {
  const socket = new TestSocket();
  const stock = [], expiring = [], notices = [], errors = [];
  const subscription = createInventorySubscription({ socket, onStock: (data) => stock.push(data),
    onExpiring: (days, data) => expiring.push({ days, data }), onNotification: (notice) => notices.push(notice),
    onError: (message) => errors.push(message) });
  t.after(() => subscription.dispose());
  return { socket, subscription, stock, expiring, notices, errors };
}

test("inventory requests the full stock with requestId store after connecting, preserving server fields", (t) => {
  const { socket, stock } = setup(t);
  assert.equal(socket.sent.length, 0);
  socket.open();
  assert.deepEqual(socket.sent, [{ event: "inventory:getStock", payload: { requestId: "store" } }]);
  socket.receive("inventory:stockResult", { requestId: "another", data: [batch] });
  assert.equal(stock.length, 0);
  socket.receive("inventory:stockResult", { requestId: "store", data: [batch] });
  assert.deepEqual(stock, [[batch]]);
});

test("expiry and manual write-off replace the snapshot, deduplicate paired events and preserve decimals", (t) => {
  const { socket, stock, notices } = setup(t);
  socket.open();
  const event = { eventId: "expiry-1", reason: "EXPIRATION_WRITE_OFF", data: [batch],
    notifications: [{ productId: 75, productName: "Молоко", message: "Молоко: остаток списан.", severity: "warning" }] };
  socket.receive("inventory:batchExpired", event);
  socket.receive("inventory:stockChanged", event);
  assert.equal(stock.length, 1);
  assert.equal(stock[0][0].availableQuantity, 2.99);
  assert.equal(notices.length, 1);
  assert.equal(notices[0].message, "Молоко: остаток списан.");
  socket.receive("inventory:stockChanged", { eventId: "manual-1", reason: "MANUAL_WRITE_OFF", data: [], message: "Масло списано вручную" });
  assert.deepEqual(stock.at(-1), []);
  assert.equal(notices.length, 2);
});

test("an initial stock response cannot restore batches removed by a newer broadcast", (t) => {
  const { socket, stock } = setup(t);
  socket.open();
  socket.receive("inventory:stockChanged", { eventId: "new", data: [] });
  socket.receive("inventory:stockResult", { requestId: "store", data: [batch] });
  assert.deepEqual(stock, [[]]);
});

test("a paired event can supply a snapshot and notifications missing from the first event", (t) => {
  const { socket, stock, notices } = setup(t);
  socket.open();
  socket.receive("inventory:stockResult", { requestId: "store", data: [batch] });
  socket.receive("inventory:batchExpired", { eventId: "paired" });
  socket.receive("inventory:stockChanged", { eventId: "paired", data: [], message: "Партия списана" });
  socket.receive("inventory:stockResult", { requestId: "store", data: [batch] });
  assert.deepEqual(stock.at(-1), []);
  assert.equal(notices.length, 1);
});

test("expiring queries carry thresholds, discard obsolete replies and refresh on stock changes", (t) => {
  const { socket, subscription, expiring } = setup(t);
  subscription.setDaysThresholds([7, 14]);
  socket.open();
  const requests = socket.sent.filter((entry) => entry.event === "inventory:getExpiringSoon");
  assert.deepEqual(requests.map((entry) => entry.payload.daysThreshold), [7, 14]);
  socket.receive("inventory:stockChanged", { eventId: "changed", data: [batch] });
  const fresh = socket.sent.filter((entry) => entry.event === "inventory:getExpiringSoon").slice(-2);
  socket.receive("inventory:expiringSoonResult", { requestId: requests[0].payload.requestId, data: [{ batchId: 1 }] });
  assert.deepEqual(expiring, []);
  socket.receive("inventory:expiringSoonResult", { requestId: fresh[0].payload.requestId, data: [{ batchId: 93 }] });
  assert.deepEqual(expiring, [{ days: 7, data: [{ batchId: 93 }] }]);
  subscription.setDaysThresholds([14]);
  socket.receive("inventory:expiringSoonResult", { requestId: fresh[0].payload.requestId, data: [] });
  assert.equal(expiring.length, 1);
});

test("reconnect reloads stock, errors are correlated, and disposal removes listeners and timers", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { socket, subscription, stock, errors } = setup(t);
  socket.open();
  socket.receive("inventory:error", { requestId: "unrelated", message: "Ignore" });
  assert.equal(errors.length, 0);
  socket.receive("inventory:error", { requestId: "store", message: "Склад недоступен" });
  assert.equal(errors.at(-1), "Склад недоступен");
  socket.disconnect(); socket.open();
  assert.equal(socket.sent.filter((entry) => entry.event === "inventory:getStock").length, 2);
  t.mock.timers.tick(30_001);
  assert.match(errors.at(-1), /не ответил/);
  subscription.dispose();
  assert.equal([...socket.listeners.values()].reduce((sum, handlers) => sum + handlers.size, 0), 0);
  socket.receive("inventory:stockChanged", { eventId: "after", data: [batch] });
  assert.equal(stock.length, 0);
});
