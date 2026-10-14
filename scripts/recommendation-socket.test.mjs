import { test } from "node:test";
import assert from "node:assert/strict";
import { createSocketCollection } from "../src/entities/dish/api/socket-collection.ts";

class TestSocket {
  connected = false;
  listeners = new Map();
  sent = [];
  connectCalls = 0;
  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
  }
  off(event, handler) {
    this.listeners.get(event)?.delete(handler);
  }
  emit(event, payload) {
    this.sent.push({ event, payload });
  }
  connect() {
    this.connectCalls++;
  }
  receive(event, payload) {
    for (const handler of this.listeners.get(event) ?? []) handler(payload);
  }
  open() {
    this.connected = true;
    this.receive("connect");
  }
  disconnect() {
    this.connected = false;
    this.receive("disconnect");
  }
}

function setup(t, recommended = false) {
  const socket = new TestSocket();
  const snapshots = [];
  const requestId = recommended ? "recommendedListId" : "stopListId";
  const resultEvent = recommended
    ? "recommendations:dishRecommendationsResult"
    : "recommendations:stopListResult";
  const collection = createSocketCollection({
    socket,
    requestEvent: recommended
      ? "recommendations:getDishRecommendations"
      : "recommendations:getStopList",
    resultEvent,
    requestId,
    initialSearch: recommended ? undefined : "пицца",
    onChange: (state) => snapshots.push(state),
  });
  t.after(() => collection.dispose());
  return {
    socket,
    collection,
    snapshots,
    state: () => snapshots.at(-1),
    reply: (data, id = requestId) =>
      socket.receive(resultEvent, { requestId: id, data }),
  };
}

test("stop list connects before requesting, sends search, and accepts only its own response", (t) => {
  const { socket, state, reply } = setup(t);
  assert.equal(socket.sent.length, 0);
  socket.open();
  assert.deepEqual(socket.sent, [
    {
      event: "recommendations:getStopList",
      payload: { requestId: "stopListId", search: "пицца" },
    },
  ]);
  reply([{ dishId: 90 }], "recommendedListId");
  assert.equal(state().data, undefined);
  reply([{ dishId: 1 }]);
  assert.deepEqual(state(), {
    data: [{ dishId: 1 }],
    isFetching: false,
    error: null,
  });
});

test("recommendations use recommendedListId without search and preserve the server fields", (t) => {
  const { socket, state, reply } = setup(t, true);
  socket.open();
  assert.deepEqual(socket.sent, [
    {
      event: "recommendations:getDishRecommendations",
      payload: { requestId: "recommendedListId" },
    },
  ]);
  const dish = {
    dishId: 8,
    profit: null,
    costPrice: null,
    maxPortions: 4,
    recommendationScore: 0.7,
    expiringProducts: ["Сыр"],
  };
  reply([dish]);
  assert.deepEqual(state().data, [dish]);
});

test("rapid search changes coalesce without reconnecting or publishing an old result", (t) => {
  const { socket, collection, state, reply } = setup(t);
  socket.open();
  collection.setSearch("пи");
  collection.setSearch("паста");
  assert.equal(socket.sent.length, 1);
  reply([{ dishId: 1 }]);
  assert.equal(state().data, undefined);
  assert.equal(socket.sent.at(-1).payload.search, "паста");
  reply([{ dishId: 2 }]);
  assert.deepEqual(state().data, [{ dishId: 2 }]);
  assert.equal(socket.connectCalls, 1);
});

test("broadcast refreshes preserve the active search and reconnect reloads it", (t) => {
  const { socket, collection, state, reply } = setup(t);
  socket.open();
  reply([]);
  collection.setSearch("салат");
  reply([{ dishId: 3 }]);
  socket.receive("recommendations:stopListUpdated", {
    data: [{ dishId: 999 }],
  });
  assert.equal(socket.sent.at(-1).payload.search, "салат");
  assert.deepEqual(state().data, [{ dishId: 3 }]);
  socket.disconnect();
  socket.open();
  assert.equal(socket.sent.at(-1).payload.search, "салат");
  reply([]);
  assert.equal(state().error, null);
});

test("server and connection errors stop loading; retry makes a fresh request", (t) => {
  const { socket, collection, state, reply } = setup(t);
  socket.receive("connect_error", new Error("unavailable"));
  assert.equal(state().isFetching, false);
  assert.match(state().error, /unavailable/);
  socket.open();
  socket.receive("recommendations:error", {
    requestId: "stopListId",
    message: "RPC unavailable",
  });
  assert.equal(state().error, "RPC unavailable");
  collection.refetch();
  reply([]);
  assert.deepEqual(state(), { data: [], isFetching: false, error: null });
});

test("timeouts close the connection and cleanup removes all listeners", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { socket, collection, snapshots, state } = setup(t);
  socket.open();
  t.mock.timers.tick(30_001);
  assert.equal(socket.connected, false);
  assert.equal(state().isFetching, false);
  assert.match(state().error, /не ответил вовремя/);
  collection.refetch();
  assert.equal(socket.connectCalls, 2);
  collection.dispose();
  assert.equal(
    [...socket.listeners.values()].reduce(
      (sum, handlers) => sum + handlers.size,
      0,
    ),
    0,
  );
  const count = snapshots.length;
  socket.open();
  t.mock.timers.tick(30_001);
  assert.equal(snapshots.length, count);
});
