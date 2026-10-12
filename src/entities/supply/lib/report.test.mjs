import { test } from "node:test";
import assert from "node:assert/strict";
import { getSupplyReportData } from "./report.ts";

const supply = {
  id: 48, supplyNumber: "П-2026-0048", receivedAt: "2026-10-11 08:30:00", acceptedBy: "Иван Крылов",
  items: [{ id: 1, product: { id: 1, name: "=1+1", unit: { id: 7, name: "Килограмм", shortName: "кг" } }, quantity: 1.25, expiresAt: "2026-10-20 18:45:00" }],
};

test("report preserves supply number, literal product names and quantities and uses fixed prices", () => {
  const rows = getSupplyReportData(supply, 0);
  assert.ok(rows[0][0].value.includes(supply.supplyNumber));
  assert.equal(rows[3][1].value, supply.supplyNumber);
  assert.equal(rows[4][1].value, "—");
  const item = rows[11];
  assert.equal(item[0].value, "00001");
  assert.equal(item[0].type, String);
  assert.equal(item[1].value, "=1+1");
  assert.equal(item[1].type, String);
  assert.equal(item[2].value, 1.25);
  assert.equal(item[3].value, "кг");
  assert.equal(item[4].value, 0);
  assert.equal(item[5].value, 0);
  assert.equal(rows.at(-1)[5].value, 0);
});

test("report preserves local selected time and converts server ISO timestamps to local Excel wall-clock time", () => {
  process.env.TZ = "Europe/Moscow";
  const rows = getSupplyReportData(supply, 0);
  assert.equal(rows[5][1].value.toISOString(), "2026-10-11T08:30:00.000Z");
  assert.equal(rows[11][6].value.toISOString(), "2026-10-20T18:45:00.000Z");
  const isoRows = getSupplyReportData({ ...supply, receivedAt: "2026-10-11T08:30:00.000Z" }, 0);
  assert.equal(isoRows[5][1].value.toISOString(), "2026-10-11T11:30:00.000Z");
});

test("report includes every server position without inventing product prices or supplier data", () => {
  const rows = getSupplyReportData({ ...supply, items: [...supply.items, { ...supply.items[0], id: 2 }] }, 0);
  assert.equal(rows.length, 14);
  assert.equal(rows[7][1].value, 2);
  assert.equal(rows[8][1].value, 0);
});
