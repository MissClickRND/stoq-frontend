import { Badge, Group, Stack, Table, Text } from "@mantine/core";
import { IconClock, IconPackageOff } from "@tabler/icons-react";
import {
  DishIdentity,
  formatMoney,
  type DishStopListStatus,
  type IStopListDish,
} from "@/entities/dish";

import { DishDetailsButton } from "../common/DishDetailsButton";

const reasonLabels: Record<DishStopListStatus, string> = {
  INSUFFICIENT_STOCK: "Закончился",
  EXPIRED_INGREDIENT: "Просрочен",
  ACTIVE: "Активен",
};

export function StopListRow({ dish }: { dish: IStopListDish }) {
  const unavailableIngredients = new Set(
    dish.reasons
      .filter((reason) => reason.status !== "ACTIVE")
      .map((reason) => reason.name),
  ).size;
  return (
    <Table.Tr>
      <Table.Td>
        <DishIdentity dish={{ name: dish.dishName }} />
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {formatMoney(dish.salePrice)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {dish.maxPortions}
        </Text>
      </Table.Td>
      <Table.Td>
        <Stack gap="xs">
          {dish.reasons.length ? (
            dish.reasons.map((reason) => {
              const ReasonIcon =
                reason.status === "EXPIRED_INGREDIENT"
                  ? IconClock
                  : IconPackageOff;
              return (
                <Group
                  key={`${reason.status}:${reason.name}`}
                  gap="xs"
                  wrap="nowrap"
                  c="red"
                >
                  <ReasonIcon size={22} style={{ flexShrink: 0 }} aria-hidden />
                  <Text size="lg" fw={600} maw={280}>
                    {reason.name}: {reasonLabels[reason.status]}
                  </Text>
                </Group>
              );
            })
          ) : (
            <Text c="dimmed">Причина не указана</Text>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {unavailableIngredients}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge size="lg" variant="light" color="red" tt="none">
          В стоп-листе
        </Badge>
      </Table.Td>
      <Table.Td>
        <DishDetailsButton id={dish.dishId} />
      </Table.Td>
    </Table.Tr>
  );
}
