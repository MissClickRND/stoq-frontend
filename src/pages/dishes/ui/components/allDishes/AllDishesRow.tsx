import { Group, Table, Text } from "@mantine/core";
import { IconPackage } from "@tabler/icons-react";
import type { Dish } from "../../../model/type";
import { formatMoney } from "../../../model/calculations";
import { DishIdentity } from "../common/DishIdentity";
import { DishStatus } from "../common/DishStatus";
import { DishDetailsButton } from "../common/DishDetailsButton";

export function AllDishesRow({ dish }: { dish: Dish }) {
  return (
    <Table.Tr>
      <Table.Td>
        <DishIdentity dish={dish} />
      </Table.Td>
      <Table.Td>
        <Text fw={700} size="md">
          {formatMoney(dish.price)}
        </Text>
      </Table.Td>
      <Table.Td>
        <DishStatus dish={dish} />
      </Table.Td>
      <Table.Td>
        <Group gap={6} wrap="nowrap">
          <IconPackage size={20} aria-hidden />
          <Text size="md" fw={700}>
            {dish.ingredients.length}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <DishDetailsButton id={dish.id} />
      </Table.Td>
    </Table.Tr>
  );
}
