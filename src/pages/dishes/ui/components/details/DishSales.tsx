import { Box, Group, Paper, Stack, Text, Title } from "@mantine/core";
import type { Dish } from "../../../model/type";
import classes from "./DishDetails.module.css";

export function DishSales({ dish }: { dish: Dish }) {
  const max = Math.max(1, ...dish.sales.map((sale) => sale.quantity));
  return (
    <Paper withBorder p="md">
      <Group justify="space-between">
        <Title order={3} size="h5">
          Динамика продаж
        </Title>
        <Text size="xs" c="dimmed">
          Последние 7 дней
        </Text>
      </Group>
      {dish.sales.length ? (
        <Box
          className={classes.chart}
          role="img"
          aria-label={dish.sales
            .map((sale) => `${sale.date}: ${sale.quantity} порций`)
            .join(", ")}
        >
          {dish.sales.map((sale) => (
            <Stack key={sale.date} className={classes.chartColumn} gap={6}>
              <Text size="xs" ta="center">
                {sale.quantity}
              </Text>
              <Box
                className={classes.bar}
                h={Math.max(2, (sale.quantity / max) * 120)}
              />
              <Text size="xs" c="dimmed" ta="center">
                {sale.date.slice(8)}.{sale.date.slice(5, 7)}
              </Text>
            </Stack>
          ))}
        </Box>
      ) : (
        <Text c="dimmed" py="xl">
          Продаж пока нет
        </Text>
      )}
    </Paper>
  );
}
