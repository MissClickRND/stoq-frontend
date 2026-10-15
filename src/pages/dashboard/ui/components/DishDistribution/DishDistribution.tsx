import { DonutChart } from "@mantine/charts";
import { Paper, Title, Text, Group, ColorSwatch } from "@mantine/core";
import type { IDishStatisticResponse } from "@/entities/statistic";
import { StatisticsFeedback } from "@/shared/ui/statistics-feedback";
export function DishDistribution({ query }: { query: { currentData?: IDishStatisticResponse; isError: boolean; isFetching: boolean; refetch: () => unknown } }) {
  const data = query.currentData;
  const segments = data ? [{ name: "Доступно", value: data.active + data.lowStock, color: "primary.6" }, { name: "Стоп-лист", value: data.stopList, color: "red.6" }] : [];
  return <Paper withBorder p="lg" radius="lg" h="100%" component="section" aria-label="Распределение блюд"><Title order={2} size="h4" mb="md">Блюда в меню</Title><StatisticsFeedback query={query} />{!query.isError && data && (data.total ? <><Group justify="center"><DonutChart data={segments} chartLabel={String(data.total)} size={170} thickness={22} withTooltip /></Group><Group justify="center" mt="md">{segments.map(item => <Group key={item.name} gap={5}><ColorSwatch color={`var(--mantine-color-${item.name === "Доступно" ? "primary" : "red"}-6)`} size={10} /><Text size="xs">{item.name}: {item.value}</Text></Group>)}</Group></> : <Text c="dimmed" size="sm">Блюд в меню пока нет</Text>)}</Paper>;
}
