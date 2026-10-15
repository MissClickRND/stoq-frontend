import { test } from "node:test";
import assert from "node:assert/strict";
import * as format from "../src/shared/lib/format.ts";
import * as shelfLife from "../src/entities/store/lib/shelf-life.ts";

test("expiry colors use independent date thresholds, including boundary days and expired dates", () => {
  assert.equal(typeof shelfLife.getShelfLifeColor, "function");
  for (const [days, color] of [[30, "green"], [8, "green"], [7, "green"], [6, "yellow"], [3, "yellow"], [2, "orange"], [1, "red"], [0, "red"], [-1, "red"], [null, "gray"]])
    assert.equal(shelfLife.getShelfLifeColor(days), color, `days: ${days}`);
});

test("article IDs are padded to five digits without truncating longer IDs", () => {
  assert.equal(typeof format.normalizeArticle, "function");
  for (const [id, expected] of [[1, "00001"], [27, "00027"], [0, "00000"], ["00008", "00008"], [12345, "12345"], [123456, "123456"]])
    assert.equal(format.normalizeArticle(id), expected);
  for (const id of [undefined, null, "", "—", -1, NaN])
    assert.equal(format.normalizeArticle(id), "—");
});

test("ISO expiry uses local calendar days and local date and time, including offset across midnight", () => {
  process.env.TZ = "Europe/Moscow";
  const now = new Date("2026-10-12T20:00:00Z");
  assert.equal(shelfLife.getShelfLifeDays("2026-10-14T22:30:00Z", now), 3);
  assert.equal(shelfLife.getShelfLifeDays("2026-10-11T22:30:00Z", now), 0);
  assert.equal(shelfLife.getShelfLifeDays("2026-10-10T22:30:00Z", now), -1);
  assert.equal(typeof shelfLife.formatShelfLifeDate, "function");
  assert.equal(shelfLife.formatShelfLifeDate("2026-10-14T22:30:00Z"), "15.10.2026, 01:30");
  process.env.TZ = "America/New_York";
  assert.equal(shelfLife.formatShelfLifeDate("2026-10-14T22:30:00Z"), "14.10.2026, 18:30");
  assert.equal(shelfLife.getShelfLifeDays("2026-10-14T22:30:00Z", now), 2);
  for (const value of ["—", "", "invalid"]) {
    assert.equal(shelfLife.getShelfLifeDays(value, now), null);
    assert.equal(shelfLife.formatShelfLifeDate(value), "—");
  }
  process.env.TZ = "Europe/Moscow";
  assert.equal(shelfLife.getShelfLifeDays("15.10.2026", now), 3);
  assert.equal(shelfLife.getShelfLifeDays("31.02.2026", now), null);
});
