import { test } from "node:test";
import assert from "node:assert/strict";
import { reduceEdgeCrossings, countEdgeCrossings } from "./crossings.ts";

test("crossing reduction untangles independent connections without moving node boxes closer", () => {
  const nodes = [
    { id: "a", type: "ingredient", x: 0, y: 0 },
    { id: "b", type: "ingredient", x: 0, y: 200 },
    { id: "c", type: "dish", x: 300, y: 200 },
    { id: "d", type: "dish", x: 300, y: 0 },
  ];
  const edges = [
    { source: "a", target: "c" },
    { source: "b", target: "d" },
  ];
  const before = nodes.map(({ x, y }) => [x, y]).sort();
  assert.equal(countEdgeCrossings(nodes, edges), 1);
  reduceEdgeCrossings(nodes, edges);
  assert.equal(countEdgeCrossings(nodes, edges), 0);
  assert.deepEqual(nodes.map(({ x, y }) => [x, y]).sort(), before);
});

test("connections sharing an endpoint are not counted as crossings", () => {
  const nodes = [
    { id: "a", type: "ingredient", x: 0, y: 0 },
    { id: "b", type: "dish", x: 200, y: 0 },
    { id: "c", type: "dish", x: 200, y: 200 },
  ];
  assert.equal(
    countEdgeCrossings(nodes, [
      { source: "a", target: "b" },
      { source: "a", target: "c" },
    ]),
    0,
  );
});
