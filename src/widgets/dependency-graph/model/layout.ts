import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from "d3-force";
import type {
  DependencyGraph,
  DependencyNode,
} from "@/entities/dependency-graph";
import { reduceEdgeCrossings } from "./crossings.ts";

export const getNodeSize = (type: DependencyNode["type"], detailed = false) =>
  type === "dish"
    ? { width: detailed ? 232 : 216, height: detailed ? 96 : 76 }
    : { width: detailed ? 208 : 172, height: detailed ? 70 : 44 };

type LayoutNode = SimulationNodeDatum & {
  id: string;
  type: DependencyNode["type"];
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
};

// Resolve full rectangles, including ingredient labels, rather than just the dots.
function separateNodes(nodes: LayoutNode[], padding: number) {
  let collisions = 0;
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    for (const b of nodes.slice(i + 1)) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const overlapX = (a.width + b.width) / 2 + padding - Math.abs(dx);
      const overlapY = (a.height + b.height) / 2 + padding - Math.abs(dy);
      if (overlapX <= 0 || overlapY <= 0) continue;
      collisions++;
      if (overlapX < overlapY) {
        const shift = (overlapX / 2 + 0.1) * (dx >= 0 ? 1 : -1);
        a.x -= shift;
        b.x += shift;
      } else {
        const shift = (overlapY / 2 + 0.1) * (dy >= 0 ? 1 : -1);
        a.y -= shift;
        b.y += shift;
      }
    }
  }
  return collisions;
}

export function layoutGraph(graph: DependencyGraph) {
  const positions = new Map<string, { x: number; y: number }>();
  if (!graph.nodes.length) return positions;
  const sorted = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id));
  const dishes = sorted.filter((node) => node.type === "dish");
  const radius = Math.max(260, Math.sqrt(dishes.length) * 140);
  const centers = new Map(
    dishes.map((node, i) => {
      const angle = (i / dishes.length) * Math.PI * 2 - Math.PI / 2;
      return [
        node.id,
        {
          x: Math.cos(angle) * radius * 1.6,
          y: Math.sin(angle) * radius * 0.7,
        },
      ];
    }),
  );
  const nodes: LayoutNode[] = sorted.map((node, i) => {
    let center = centers.get(node.id);
    if (!center) {
      const neighbors = graph.edges
        .filter((edge) => edge.source === node.id)
        .flatMap((edge) => centers.get(edge.target) ?? []);
      const angle = i * 2.3999632297;
      center = {
        x:
          neighbors.reduce((sum, point) => sum + point.x, 0) /
            (neighbors.length || 1) +
          Math.cos(angle) * 230,
        y:
          neighbors.reduce((sum, point) => sum + point.y, 0) /
            (neighbors.length || 1) +
          Math.sin(angle) * 180,
      };
    }
    return {
      id: node.id,
      type: node.type,
      ...getNodeSize(node.type),
      ...center,
      anchorX: center.x,
      anchorY: center.y,
    };
  });
  const ids = new Set(nodes.map((node) => node.id));
  const links = graph.edges
    .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
    .map((edge) => ({ source: edge.source, target: edge.target }));
  const simulation = forceSimulation(nodes)
    .stop()
    .force(
      "links",
      forceLink<LayoutNode, (typeof links)[number]>(links)
        .id((node) => node.id)
        .distance(240)
        .strength(0.16),
    )
    .force("charge", forceManyBody().strength(-320))
    .force("x", forceX<LayoutNode>((node) => node.anchorX).strength(0.08))
    .force("y", forceY<LayoutNode>((node) => node.anchorY).strength(0.1));
  for (let i = 0; i < 280; i++) {
    simulation.tick();
    separateNodes(nodes, 56);
  }
  for (let i = 0; i < 160 && separateNodes(nodes, 56); i++) {
    /* settle remaining collisions */
  }
  reduceEdgeCrossings(nodes, graph.edges);
  for (const node of nodes)
    positions.set(node.id, {
      x: node.x - node.width / 2,
      y: node.y - node.height / 2,
    });
  return positions;
}
