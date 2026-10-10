import { Badge, Paper, ScrollArea, Table, Text, Title } from "@mantine/core";
import type { Dish } from "../../../model/type";
import { formatMoney, isIngredientExpired } from "../../../model/calculations";

export function DishIngredients({ dish }: { dish: Dish }) {
  return (
    <Paper withBorder p="md">
      <Title order={3} size="h5" mb="md">
        Ингредиенты блюда
      </Title>
      <ScrollArea>
        <Table miw={620} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ингредиент</Table.Th>
              <Table.Th>На порцию</Table.Th>
              <Table.Th>Остаток</Table.Th>
              <Table.Th>Затраты</Table.Th>
              <Table.Th>Статус</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {dish.ingredients.map((item) => {
              const expired = isIngredientExpired(item);
              const available = !expired && item.stock >= item.quantity;
              return (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {item.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {item.quantity} {item.unit}
                  </Table.Td>
                  <Table.Td>
                    {item.stock} {item.unit}
                  </Table.Td>
                  <Table.Td>
                    {formatMoney(item.quantity * item.costPerUnit)}
                  </Table.Td>
                  <Table.Td>
                    <Badge
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
