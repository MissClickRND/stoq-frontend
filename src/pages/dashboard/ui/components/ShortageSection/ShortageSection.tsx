import { Paper, Title, Text, ScrollArea, Table } from "@mantine/core";
import { useGetShortageStatisticQuery, statisticsQueryOptions } from "@/entities/statistic";
import { StatisticsFeedback } from "@/shared/ui/statistics-feedback";
export function ShortageSection({ days }: { days: number }) {
  const query = useGetShortageStatisticQuery(days, statisticsQueryOptions);
  return <Paper withBorder p="lg" radius="lg" h="100%" component="section" aria-label="Дефицит продуктов"><Title order={2} size="h4">Чаще всего не хватает</Title><Text size="xs" c="dimmed" mb="sm">Случаи нехватки за {days} дн.</Text><StatisticsFeedback query={query} />{!query.isError && query.currentData && (query.currentData.items.length ? <ScrollArea h={210}><Table><Table.Thead><Table.Tr><Table.Th>Продукт</Table.Th><Table.Th>Случаи</Table.Th><Table.Th>Блюда</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{query.currentData.items.map(item => <Table.Tr key={item.productId}><Table.Td>{item.name}</Table.Td><Table.Td>{item.incidents}</Table.Td><Table.Td>{item.affectedDishes}</Table.Td></Table.Tr>)}</Table.Tbody></Table></ScrollArea> : <Text c="dimmed" size="sm">{query.currentData.trackingStartedAt ? "За выбранный период случаев нехватки не зафиксировано." : "Наблюдение только начинается. История появится после первых случаев нехватки."}</Text>)}</Paper>;
}
