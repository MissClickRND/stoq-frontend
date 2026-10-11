import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export const RecipeConnection = memo(function RecipeConnection(
  props: EdgeProps,
) {
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    curvature: 0.18,
  });
  return (
    <BaseEdge
      id={props.id}
      path={path}
      style={props.style}
      interactionWidth={0}
    />
  );
});
