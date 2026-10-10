import { Badge } from "@mantine/core";
import type { DishPriority } from "../../../model/type";
import { priorityLabels } from "../../../model/data";

export function RecommendationPriority({
  priority,
}: {
  priority: DishPriority;
}) {
  const item = priorityLabels[priority];
  return (
    <Badge
      w="max-content"
      miw="max-content"
      size="lg"
      fz="sm"
      fw={600}
      variant="light"
      color={item.color}
      tt="none"
    >
      {item.label}
    </Badge>
  );
}
