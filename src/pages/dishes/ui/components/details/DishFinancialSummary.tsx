import { Box, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { formatMoney } from "@/entities/dish";
import type { DishDetailsStatistic } from "@/entities/statistic";
export function DishFinancialSummary({ statistic }: { statistic: DishDetailsStatistic }) {
  const items = [{ title: "Продано порций", value: statistic.week }, { title: "Выручка с продаж", value: formatMoney(statistic.revenue) }, { title: "Оценка затрат на ингредиенты", value: formatMoney(statistic.ingredientCost) }, { title: "Расчётная прибыль до прочих расходов", value: formatMoney(statistic.earning) }];
  return <Paper withBorder p="md"><Title order={3} size="h5" mb="md">Финансы за последние 7 дней</Title><SimpleGrid cols={{ base: 2, lg: 4 }}>{items.map(item => <Box key={item.title}><Text size="xs" c="dimmed">{item.title}</Text><Text fw={700} size="lg">{item.value}</Text></Box>)}</SimpleGrid><Text size="xs" c="dimmed" mt="sm">Затраты и прибыль оценены по текущей себестоимости рецепта.</Text></Paper>;
}
