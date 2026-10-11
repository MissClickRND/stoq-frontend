import { Box, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { type Dish, dishCost, dishProfit, formatMoney } from "@/entities/dish";

export function DishFinancialSummary({ dish }: { dish: Dish }) {
  const sold = dish.sales.reduce((sum, sale) => sum + sale.quantity, 0);
  return (
    <Paper withBorder p="md">
      <Title order={3} size="h5" mb="md">
        Финансы за последние 7 дней
      </Title>
      <SimpleGrid cols={{ base: 2, lg: 4 }}>
        <Box>
          <Text size="xs" c="dimmed">
            Продано порций
          </Text>
          <Text fw={700} size="lg">
            {sold}
          </Text>
        </Box>
        <Box>
          <Text size="xs" c="dimmed">
            Выручка с продаж
          </Text>
          <Text fw={700} size="lg">
            {formatMoney(sold * dish.price)}
          </Text>
        </Box>
        <Box>
          <Text size="xs" c="dimmed">
            Затрачено на ингредиенты
          </Text>
          <Text fw={700} size="lg">
            {formatMoney(sold * dishCost(dish))}
          </Text>
        </Box>
        <Box>
          <Text size="xs" c="dimmed">
            Прибыль до прочих расходов
          </Text>
          <Text fw={700} size="lg" c={dishProfit(dish) >= 0 ? "green" : "red"}>
            {formatMoney(sold * dishProfit(dish))}
          </Text>
        </Box>
      </SimpleGrid>
    </Paper>
  );
}
