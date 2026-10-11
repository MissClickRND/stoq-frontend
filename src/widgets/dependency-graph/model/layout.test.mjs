import { test } from "node:test";
import assert from "node:assert/strict";
import { layoutGraph, getNodeSize } from "./layout.ts";
import { mockDependencyGraph } from "../../../entities/dependency-graph/model/mock.ts";

test("layout is deterministic, preserves backend IDs and does not mutate its input", () => {
  const before = JSON.stringify(mockDependencyGraph);
  const positions = layoutGraph(mockDependencyGraph);
  assert.deepEqual(positions, layoutGraph(mockDependencyGraph));
  assert.equal(JSON.stringify(mockDependencyGraph), before);
  assert.equal(positions.size, mockDependencyGraph.nodes.length);
  for (const node of mockDependencyGraph.nodes) {
    const position = positions.get(node.id);
    assert.ok(Number.isFinite(position?.x) && Number.isFinite(position?.y));
  }
});

test("ingredient labels and dish cards do not overlap after layout", () => {
  const positions = layoutGraph(mockDependencyGraph);
  for (let i = 0; i < mockDependencyGraph.nodes.length; i++) {
    const a = mockDependencyGraph.nodes[i];
    const pa = positions.get(a.id);
    const sa = getNodeSize(a.type);
    for (const b of mockDependencyGraph.nodes.slice(i + 1)) {
      const pb = positions.get(b.id);
      const sb = getNodeSize(b.type);
      assert.ok(
        pa.x + sa.width + 48 <= pb.x ||
          pb.x + sb.width + 48 <= pa.x ||
          pa.y + sa.height + 48 <= pb.y ||
          pb.y + sb.height + 48 <= pa.y,
        `${a.data.name} overlaps ${b.data.name}`,
      );
    }
  }
});

test("layout handles an empty graph, isolated nodes and dangling edges", () => {
  assert.equal(layoutGraph({ nodes: [], edges: [] }).size, 0);
  const node = mockDependencyGraph.nodes[0];
  const result = layoutGraph({
    nodes: [node],
    edges: [
      {
        id: "broken",
        source: node.id,
        target: "missing",
        data: { required: 1, unit: "кг", status: "available" },
      },
    ],
  });
  assert.equal(result.size, 1);
  assert.ok(Number.isFinite(result.get(node.id).x));
});
