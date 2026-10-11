import { Group, Table, Text } from "@mantine/core";
import { IconClock, IconPackageOff } from "@tabler/icons-react";
import {
  type Dish,
  missingIngredients,
  isIngredientExpired,
  unavailableReason,
  DishIdentity,
  DishStatus,
} from "@/entities/dish";

import { DishDetailsButton } from "../common/DishDetailsButton";

export function StopListRow({ dish }: { dish: Dish }) {
  const ReasonIcon = missingIngredients(dish).some(isIngredientExpired)
    ? IconClock
    : IconPackageOff;
  return (
    <Table.Tr>
      <Table.Td>
        <DishIdentity dish={dish} />
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap" c="red">
          <ReasonIcon size={22} style={{ flexShrink: 0 }} aria-hidden />
          <Text size="lg" fw={600} maw={280}>
            {unavailableReason(dish)}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {missingIngredients(dish).length}
        </Text>
      </Table.Td>
      <Table.Td>
        <DishStatus dish={dish} />
      </Table.Td>
      <Table.Td>
        <DishDetailsButton id={dish.id} />
      </Table.Td>
    </Table.Tr>
  );
}
