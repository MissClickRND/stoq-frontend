import { memo, type CSSProperties } from "react";
import { IconSoupFilled } from "@tabler/icons-react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { statusPresentation } from "../../model/config";
import type { FlowNode } from "../../model/type";
import classes from "./GraphNode.module.css";

export const GraphNode = memo(function GraphNode({
  data,
}: NodeProps<FlowNode>) {
  const { node, dimmed, emphasized } = data;
  const status = statusPresentation[node.data.status];
  const isIngredient = node.type === "ingredient";
  const quantity =
    node.type === "ingredient"
      ? `${new Intl.NumberFormat("ru-RU").format(node.data.quantity)} ${node.data.unit}`
      : "";
  return (
    <div
      className={`${isIngredient ? classes.ingredient : classes.dish} ${dimmed ? classes.dimmed : ""} ${emphasized ? classes.emphasized : ""}`}
      style={{ "--node-color": status.color } as CSSProperties}
      tabIndex={0}
      onFocus={() => data.onInspect(node.id)}
      onBlur={() => data.onInspect(null)}
      aria-label={`${isIngredient ? "Ингредиент" : "Блюдо"}: ${node.data.name}, ${isIngredient ? `${quantity}, ${status.label}` : status.dishLabel}`}
    >
      {isIngredient ? (
        <span className={classes.dot} />
      ) : (
        <span className={classes.dishIcon}>
          <IconSoupFilled size={24} stroke={1.6} />
        </span>
      )}
      <span className={classes.content}>
        <span className={classes.name}>{node.data.name}</span>
        {/* <span className={classes.caption}>
          {isIngredient ? quantity : status.dishLabel}
        </span> */}
      </span>
      {[Position.Left, Position.Right, Position.Top, Position.Bottom].map(
        (position) => (
          <Handle
            key={position}
            id={position}
            type={isIngredient ? "source" : "target"}
            position={position}
            className={`${classes.handle} ${isIngredient ? classes.ingredientHandle : ""}`}
            isConnectable={false}
          />
        ),
      )}
    </div>
  );
});
