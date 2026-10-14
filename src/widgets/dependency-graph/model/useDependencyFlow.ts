import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import {
  useNodesState,
  type Edge,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { DependencyGraph } from "@/entities/dependency-graph";
import { getNodeSize, layoutGraph } from "./layout";
import { statusPresentation } from "./config";
import type { FlowNode } from "./type";
import { layoutDishGraph } from "./explorer";

function getNeighbors(graph: DependencyGraph, ids: Set<string>) {
  const related = new Set(ids);
  for (const edge of graph.edges) {
    if (ids.has(edge.source) || ids.has(edge.target)) {
      related.add(edge.source);
      related.add(edge.target);
    }
  }
  return related;
}

export function useDependencyFlow(
  graph: DependencyGraph,
  colorMode: "light" | "dark",
  { detailed = false, onSelectDish }: { detailed?: boolean; onSelectDish?: (id: string) => void } = {},
) {
  const [search, setSearch] = useState("");
  const [query] = useDebouncedValue(
    search.trim().toLocaleLowerCase("ru-RU"),
    180,
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [instance, setInstance] = useState<ReactFlowInstance<
    FlowNode,
    Edge
  > | null>(null);
  const [zoom, setZoom] = useState(1);
  const initialNodes = useMemo<FlowNode[]>(() => {
    const positions = detailed ? layoutDishGraph(graph) : layoutGraph(graph);
    return graph.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: positions.get(node.id)!,
      data: { node, dimmed: false, emphasized: false, onInspect: setHovered, detailed, onSelectDish },
      ...getNodeSize(node.type, detailed),
      draggable: true,
      selectable: false,
      connectable: false,
    }));
  }, [graph, detailed, onSelectDish]);
  const [localNodes, setLocalNodes, onNodesChange] =
    useNodesState<FlowNode>(initialNodes);
  useEffect(() => {
    setLocalNodes(initialNodes);
    setHovered(null);
  }, [initialNodes, setLocalNodes]);

  const matches = useMemo(
    () =>
      new Set(
        graph.nodes
          .filter(
            (node) =>
              query &&
              node.data.name.toLocaleLowerCase("ru-RU").includes(query),
          )
          .map((node) => node.id),
      ),
    [graph, query],
  );
  const searchFocus = useMemo(
    () => getNeighbors(graph, matches),
    [graph, matches],
  );
  const focused = useMemo(
    () => (hovered ? getNeighbors(graph, new Set([hovered])) : searchFocus),
    [graph, hovered, searchFocus],
  );
  const hasFocus = !detailed && Boolean(hovered || query);
  const nodes = useMemo(
    () =>
      localNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          dimmed: hasFocus && !focused.has(node.id),
          emphasized: hovered === node.id || matches.has(node.id),
        },
      })),
    [localNodes, hasFocus, focused, hovered, matches],
  );

  // Connections follow local coordinates while dragging; backend data stays intact.
  const edges = useMemo<Edge[]>(() => {
    const positions = new Map(
      localNodes.map((node) => [node.id, node.position]),
    );
    const dishSize = getNodeSize("dish", detailed);
    return graph.edges
      .filter(
        (edge) => positions.has(edge.source) && positions.has(edge.target),
      )
      .map((edge) => {
        const source = positions.get(edge.source)!;
        const target = positions.get(edge.target)!;
        const halfWidth = dishSize.width / 2;
        const halfHeight = dishSize.height / 2;
        const dx = target.x + halfWidth - (source.x + 10);
        const dy = target.y + halfHeight - (source.y + 22);
        const highlighted =
          focused.has(edge.source) && focused.has(edge.target);
        return {
          ...edge,
          data: { ...edge.data, showLabel: detailed || (hasFocus && highlighted) },
          type: "recipe",
          selectable: false,
          focusable: false,
          reconnectable: false,
          sourceHandle: detailed ? "right" :
            Math.abs(dx) > Math.abs(dy)
              ? dx > 0
                ? "right"
                : "left"
              : dy > 0
                ? "bottom"
                : "top",
          targetHandle: detailed ? "left" :
            Math.abs(dx) / halfWidth > Math.abs(dy) / halfHeight
              ? dx > 0
                ? "left"
                : "right"
              : dy > 0
                ? "top"
                : "bottom",
          style: {
            stroke: statusPresentation[edge.data.status].color,
            strokeWidth: hasFocus && highlighted ? 2.2 : 1.5,
            opacity: hasFocus
              ? highlighted
                ? 0.9
                : 0.06
              : colorMode === "dark"
                ? 0.7
                : 0.55,
          },
          ariaLabel: `Требуется ${edge.data.required} ${edge.data.unit}: ${statusPresentation[edge.data.status].label}`,
        };
      });
  }, [graph, localNodes, focused, hasFocus, colorMode, detailed]);

  useEffect(() => {
    if (!instance || (query && !matches.size)) return;
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        void instance.fitView({
          nodes: query ? [...searchFocus].map((id) => ({ id })) : undefined,
          padding: detailed ? 0.2 : 0.12,
          maxZoom: query ? 1.2 : 1,
          duration: 250,
        });
      });
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); };
  }, [instance, query, matches, searchFocus, initialNodes, detailed]);

  return {
    search,
    setSearch,
    query,
    matches,
    nodes,
    edges,
    onNodesChange,
    setHovered,
    instance,
    setInstance,
    zoom,
    setZoom,
  };
}
