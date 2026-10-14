import { Badge } from "@mantine/core";

import type { Dish, IDish } from "../model/type";
import { dishIsStopped, dishPortions } from "../lib/calculations";

export function DishStatus({ dish }: { dish: IDish | Dish }) {
  const portions = "ingredients" in dish ? dishPortions(dish) : dish.availablePortions;
  const archived = "archived" in dish && dish.archived;
  const stopped = "ingredients" in dish ? dishIsStopped(dish) : portions === 0;
  const lowStock = portions > 0 && portions < 5;
  return (
    <Badge
      w="max-content"
      miw="max-content"
      size="lg"
      fw={600}
      color={archived ? "gray" : stopped ? "red" : lowStock ? "orange" : "green"}
      variant="light"
      tt="none"
    >
      {archived ? "В архиве" : stopped ? "В стоп-листе" : lowStock ? "Заканчивается" : "Активен"}
    </Badge>
  );
}
