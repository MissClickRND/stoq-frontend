import { Badge, Group, Table, Text } from "@mantine/core";
import { IconPackage } from "@tabler/icons-react";
import { DishIdentity, DishStatus, formatMoney, type IDish } from "@/entities/dish";

import { DishDetailsButton } from "../common/DishDetailsButton";

export function AllDishesRow({ dish }: { dish: IDish }) {
  return (
    <Table.Tr>
      <Table.Td>
        <DishIdentity dish={dish} />
      </Table.Td>
      <Table.Td>
        <Badge size="lg" variant="light" color={dish.category ? "primary" : "gray"} tt="none">
          {dish.category || "Без категории"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text fw={700} size="lg">
          {formatMoney(dish.salePrice)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {dish.availablePortions}
        </Text>
      </Table.Td>
      <Table.Td>
        <DishStatus dish={dish} />
      </Table.Td>
      <Table.Td>
        <Group gap={6} wrap="nowrap">
          <IconPackage size={20} aria-hidden />
          <Text size="lg" fw={700}>
            {dish.recipeItems.length}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <DishDetailsButton id={dish.id} />
      </Table.Td>
    </Table.Tr>
  );
}
