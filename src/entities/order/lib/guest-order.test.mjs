import { test } from "node:test";
import assert from "node:assert/strict";
import {
  guestMenuPath,
  guestMenuUrl,
  buildGuestOrderPayload,
} from "./guest-order.ts";

const draft = {
  createdAt: "2026-10-11 15:00:00",
  type: "dine-in",
  table: "7",
  guests: 2,
  items: [{ dishId: "salmon", name: "Стейк", price: 1490, quantity: 2 }],
};

test("guest QR URL is absolute and encodes the restaurant id", () => {
  assert.equal(
    guestMenuPath("restaurant/1"),
    "/order/new/guest/restaurant%2F1",
  );
  assert.equal(
    guestMenuUrl("https://stoq.example", "restaurant-1"),
    "https://stoq.example/order/new/guest/restaurant-1",
  );
});

test("guest payload contains normalized order data and exact total without extra fees", () => {
  const payload = buildGuestOrderPayload(
    "restaurant-1",
    draft,
    " Анна ",
    " Без лука ",
  );
  assert.equal(payload.restaurantId, "restaurant-1");
  assert.equal(payload.source, "guest");
  assert.equal(payload.table, 7);
  assert.equal(payload.guests, 2);
  assert.equal(payload.guestName, "Анна");
  assert.equal(payload.comment, "Без лука");
  assert.equal(payload.total, 2980);
  assert.equal(payload.items[0].quantity, 2);
});

test("takeaway has no table and optional guest information can be empty", () => {
  const payload = buildGuestOrderPayload(
    "restaurant-1",
    { ...draft, type: "takeaway", table: null },
    "",
    "",
  );
  assert.equal(payload.table, null);
  assert.equal(payload.guestName, null);
  assert.equal(payload.comment, null);
});

test("invalid guest orders are rejected", () => {
  assert.throws(() =>
    buildGuestOrderPayload("restaurant-1", { ...draft, items: [] }, "", ""),
  );
  assert.throws(() =>
    buildGuestOrderPayload("restaurant-1", { ...draft, table: null }, "", ""),
  );
  assert.throws(() =>
    buildGuestOrderPayload(
      "restaurant-1",
      { ...draft, items: [{ ...draft.items[0], quantity: 0 }] },
      "",
      "",
    ),
  );
});
