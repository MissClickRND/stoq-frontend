type PointNode = { id: string; type: string; x: number; y: number };
type Link = { source: string; target: string };
type Segment = { source: string; target: string; a: PointNode; b: PointNode };

function getSegments(nodes: PointNode[], edges: Link[]): Segment[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return edges.flatMap((edge) => {
    const a = byId.get(edge.source);
    const b = byId.get(edge.target);
    return a && b ? [{ ...edge, a, b }] : [];
  });
}

function orientation(a: PointNode, b: PointNode, c: PointNode) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function countCrossings(segments: Segment[]) {
  let count = 0;
  for (let i = 0; i < segments.length; i++) {
    const a = segments[i];
    for (let j = i + 1; j < segments.length; j++) {
      const b = segments[j];
      if (
        a.source === b.source ||
        a.source === b.target ||
        a.target === b.source ||
        a.target === b.target
      )
        continue;
      if (
        orientation(a.a, a.b, b.a) * orientation(a.a, a.b, b.b) < 0 &&
        orientation(b.a, b.b, a.a) * orientation(b.a, b.b, a.b) < 0
      )
        count++;
    }
  }
  return count;
}

export function countEdgeCrossings(nodes: PointNode[], edges: Link[]) {
  return countCrossings(getSegments(nodes, edges));
}

function swapPosition(a: PointNode, b: PointNode) {
  [a.x, b.x] = [b.x, a.x];
  [a.y, b.y] = [b.y, a.y];
}

// Swap equally sized nodes in already separated slots. This preserves spacing
// while reducing straight-line crossings; curved edges can still intersect.
export function reduceEdgeCrossings(nodes: PointNode[], edges: Link[]) {
  const segments = getSegments(nodes, edges);
  let best = countCrossings(segments);
  for (let pass = 0; pass < 3 && best; pass++) {
    let improved = false;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        if (a.type !== b.type) continue;
        swapPosition(a, b);
        const next = countCrossings(segments);
        if (next < best) {
          best = next;
          improved = true;
        } else swapPosition(a, b);
      }
    }
    if (!improved) break;
  }
}
