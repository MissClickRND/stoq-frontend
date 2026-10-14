import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import classes from "./RecipeConnection.module.css";

export const RecipeConnection = memo(function RecipeConnection(
  props: EdgeProps,
) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    curvature: 0.18,
  });
  return (
    <>
    <BaseEdge
      id={props.id}
      path={path}
      style={props.style}
      interactionWidth={0}
    />
    {props.data?.showLabel && <EdgeLabelRenderer>
      <div className={classes.label} style={{
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        opacity: props.style?.opacity,
      }}>
        {new Intl.NumberFormat("ru-RU").format(Number(props.data.required))} {String(props.data.unit)}
      </div>
    </EdgeLabelRenderer>}
    </>
  );
});
