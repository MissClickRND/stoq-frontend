import { Badge } from "@mantine/core";
import type { DishPriority } from "@/entities/dish";
import { priorityLabels } from "../../../model/config";

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
      fw={600}
      variant="light"
      color={item.color}
      tt="none"
    >
      {item.label}
    </Badge>
  );
}
