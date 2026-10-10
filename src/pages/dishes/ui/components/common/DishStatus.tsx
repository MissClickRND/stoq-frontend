import { Badge } from "@mantine/core";
import { dishIsStopped } from "../../../model/calculations";
import type { Dish } from "../../../model/type";

export function DishStatus({ dish }: { dish: Dish }) {
  const stopped = dishIsStopped(dish);
  return (
    <Badge
      w="max-content"
      miw="max-content"
      size="lg"
      fz="sm"
      fw={600}
      color={dish.archived ? "gray" : stopped ? "red" : "green"}
      variant="light"
      tt="none"
    >
      {dish.archived ? "В архиве" : stopped ? "В стоп-листе" : "Активен"}
    </Badge>
  );
}
