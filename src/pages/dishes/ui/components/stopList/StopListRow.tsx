import { Group, Table, Text } from "@mantine/core";
import { IconClock, IconPackageOff } from "@tabler/icons-react";
import type { Dish } from "../../../model/type";
import {
  missingIngredients,
  isIngredientExpired,
  unavailableReason,
} from "../../../model/calculations";
import { DishIdentity } from "../common/DishIdentity";
import { DishStatus } from "../common/DishStatus";
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
          <Text size="md" fw={600} maw={280}>
            {unavailableReason(dish)}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="md" fw={700}>
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
