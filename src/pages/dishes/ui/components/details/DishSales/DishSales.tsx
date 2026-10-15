import componentClasses from "./DishSales.module.css";
import { Box, Group, Paper, Stack, Text, Title } from "@mantine/core";
import type { DishDetailsStatistic } from "@/entities/statistic";

export function DishSales({ sales }: { sales: DishDetailsStatistic["sales"] }) {
  const max = Math.max(1, ...sales.map((sale) => sale.quantity));
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
      {sales.length ? (
        <Box
          className={componentClasses.chart}
          role="img"
          aria-label={sales
            .map((sale) => `${sale.date}: ${sale.quantity} порций`)
            .join(", ")}
        >
          {sales.map((sale) => (
            <Stack
              key={sale.date}
              className={componentClasses.chartColumn}
              gap={6}
            >
              <Text size="xs" ta="center">
                {sale.quantity}
              </Text>
              <Box
                className={componentClasses.bar}
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
