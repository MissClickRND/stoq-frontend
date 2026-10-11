import { test } from "node:test";
import assert from "node:assert/strict";
import { getSupplyReportData } from "./report.ts";

const supply = {
  id: "П-2026-0048",
  supplier: "Тестовый поставщик",
  receivedAt: "2026-10-11 08:30:00",
  acceptedBy: "Иван Крылов",
  items: [
    {
      id: "one",
      product: { title: "=1+1", article: "00001" },
      quantity: 1.25,
      unit: "кг",
      unitPrice: 99.99,
      total: 124.99,
      expiresAt: "2026-10-20 18:45:00",
    },
  ],
};

test("report preserves numeric amounts, leading-zero article and literal product names", () => {
  const rows = getSupplyReportData(supply, 124.99);
  const item = rows[11];
  assert.equal(item[0].value, "00001");
  assert.equal(item[0].type, String);
  assert.equal(item[1].value, "=1+1");
  assert.equal(item[1].type, String);
  assert.equal(item[2].value, 1.25);
  assert.equal(item[2].type, Number);
  assert.equal(item[4].value, 99.99);
  assert.equal(item[5].value, 124.99);
  assert.equal(rows.at(-1)[5].value, 124.99);
});

test("report keeps date and time without timezone shifts", () => {
  const rows = getSupplyReportData(supply, 124.99);
  assert.equal(rows[5][1].value.toISOString(), "2026-10-11T08:30:00.000Z");
  assert.equal(rows[11][6].value.toISOString(), "2026-10-20T18:45:00.000Z");
  assert.equal(rows[11][6].format, "dd.mm.yyyy hh:mm");
});

test("report includes every position and the supplied grand total", () => {
  const rows = getSupplyReportData(
    {
      ...supply,
      items: [...supply.items, { ...supply.items[0], id: "two", total: 250 }],
    },
    374.99,
  );
  assert.equal(rows.length, 14);
  assert.equal(rows[7][1].value, 2);
  assert.equal(rows[8][1].value, 374.99);
  assert.equal(rows.at(-1)[5].value, 374.99);
});
