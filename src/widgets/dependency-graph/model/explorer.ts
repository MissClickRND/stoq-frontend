import type { DependencyGraph, DependencyNode } from "@/entities/dependency-graph";

export type GraphViewMode = "all" | "dish";
export type ExplorerDish = Extract<DependencyNode, { type: "dish" }>;
type Ingredient = Extract<DependencyNode, { type: "ingredient" }>;

export function getExplorerDishes(graph: DependencyGraph, search = "", onlyProblems = false) {
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const priority = { unavailable: 0, low_stock: 1, available: 2 };
  return graph.nodes
    .filter((node): node is ExplorerDish => node.type === "dish")
    .filter((node) => (!onlyProblems || node.data.status !== "available") &&
      node.data.name.toLocaleLowerCase("ru-RU").includes(query))
    .sort((a, b) => priority[a.data.status] - priority[b.data.status] ||
      a.data.name.localeCompare(b.data.name, "ru-RU"));
}

export function getDishIngredients(graph: DependencyGraph, dishId: string | null) {
  const ingredients = new Map(graph.nodes
    .filter((node): node is Ingredient => node.type === "ingredient")
    .map((node) => [node.id, node]));
  return graph.edges.filter((edge) => edge.target === dishId).flatMap((edge) => {
    const ingredient = ingredients.get(edge.source);
    return ingredient ? [{ ingredient, edge }] : [];
  });
}

export function getDishGraph(graph: DependencyGraph, dishId: string | null): DependencyGraph {
  const dish = graph.nodes.find((node) => node.type === "dish" && node.id === dishId);
  if (!dish) return { nodes: [], edges: [] };
  const rows = getDishIngredients(graph, dish.id);
  const ids = new Set([dish.id, ...rows.map((row) => row.ingredient.id)]);
  return { nodes: graph.nodes.filter((node) => ids.has(node.id)), edges: rows.map((row) => row.edge) };
}

export function layoutDishGraph(graph: DependencyGraph) {
  const positions = new Map<string, { x: number; y: number }>();
  const ingredients = graph.nodes.filter((node) => node.type === "ingredient")
    .sort((a, b) => a.data.name.localeCompare(b.data.name, "ru-RU"));
  const spacing = 104;
  ingredients.forEach((node, index) => positions.set(node.id, { x: 0, y: index * spacing }));
  for (const node of graph.nodes.filter((node) => node.type === "dish")) {
    positions.set(node.id, { x: 400, y: Math.max(0, (ingredients.length - 1) * spacing / 2 - 13) });
  }
  return positions;
}
