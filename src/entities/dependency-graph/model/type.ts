export type DependencyStatus = "available" | "low_stock" | "unavailable";
export type IngredientStatus = "available" | "low_stock" | "out_of_stock";

export type IngredientNode = {
  id: string;
  type: "ingredient";
  data: {
    name: string;
    quantity: number;
    unit: string;
    status: IngredientStatus;
  };
};

export type DishNode = {
  id: string;
  type: "dish";
  data: { name: string; status: DependencyStatus };
};

export type DependencyNode = IngredientNode | DishNode;

export type RecipeEdge = {
  id: string;
  source: string;
  target: string;
  data: { required: number; unit: string; status: DependencyStatus };
};

export type DependencyGraph = { nodes: DependencyNode[]; edges: RecipeEdge[] };
