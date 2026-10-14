import type { Node } from "@xyflow/react";
import type { DependencyNode } from "@/entities/dependency-graph";

export type FlowNode = Node<
  {
    node: DependencyNode;
    dimmed: boolean;
    emphasized: boolean;
    onInspect: (id: string | null) => void;
    detailed: boolean;
    onSelectDish?: (id: string) => void;
  },
  "ingredient" | "dish"
>;
