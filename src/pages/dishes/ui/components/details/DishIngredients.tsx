import { Badge, Paper, ScrollArea, Table, Text, Title } from "@mantine/core";
import { type Dish, formatMoney, isIngredientExpired } from "@/entities/dish";

export function DishIngredients({ dish }: { dish: Dish }) {
  return (
    <Paper withBorder p="md">
      <Title order={3} size="h5" mb="md">
        Ингредиенты блюда
      </Title>
      <ScrollArea>
        <Table miw={850}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ингредиент</Table.Th>
              <Table.Th>На порцию</Table.Th>
              <Table.Th>Остаток</Table.Th>
              <Table.Th>Затраты</Table.Th>
              <Table.Th>Цена за единицу</Table.Th>
              <Table.Th>Статус</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {dish.ingredients.map((item) => {
              const expired = isIngredientExpired(item);
              const available = !expired && item.portions != null && item.portions > 0;
              return (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text size="lg" fw={600}>
                      {item.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="lg" fw={700}>
                      {item.quantity} {item.unit}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="lg" fw={700}>
                      {item.stock} {item.unit}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="lg" fw={700}>
                      {formatMoney(item.cost ?? null)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="lg">{formatMoney(item.costPerUnit)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      size="lg"
                      miw="max-content"
                      variant="light"
                      tt="none"
                      color={available ? "green" : "red"}
                    >
                      {expired
                        ? "Просрочен"
                        : available
                          ? "Достаточно"
                          : "Недостаточно"}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
