import { Modal, Table, Text, ScrollArea } from "@mantine/core";
import { useGetWriteOffsQuery, statisticsQueryOptions, type WriteOff } from "@/entities/statistic";
import { StatisticsFeedback } from "@/shared/ui/statistics-feedback";
const date = (value: string | null) => value ? new Date(value).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }) : "—";

export function WriteOffsTable({ items }: { items: WriteOff[] }) {
  if (!items.length) return <Text c="dimmed" py="lg">Просроченных партий нет</Text>;
  return <ScrollArea><Table miw={720}>
    <Table.Thead><Table.Tr>
      <Table.Th>Продукт</Table.Th><Table.Th>Партия</Table.Th><Table.Th>Списано</Table.Th>
      <Table.Th>Срок годности истёк</Table.Th><Table.Th>Автоматически списано</Table.Th>
    </Table.Tr></Table.Thead>
    <Table.Tbody>{items.map(item => <Table.Tr key={item.batchId}>
      <Table.Td>{item.product.name}</Table.Td>
      <Table.Td>№ {item.batchId}</Table.Td>
      <Table.Td>{item.writtenOffQuantity == null ? "—" : `${item.writtenOffQuantity.toLocaleString("ru-RU", { maximumFractionDigits: 3 })} ${item.product.unit?.shortName ?? ""}`}</Table.Td>
      <Table.Td>{date(item.expiresAt)}</Table.Td><Table.Td>{date(item.writtenOffAt)}</Table.Td>
    </Table.Tr>)}</Table.Tbody>
  </Table></ScrollArea>;
}

export function WriteOffsModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const query = useGetWriteOffsQuery(undefined, { ...statisticsQueryOptions, skip: !opened });
  return <Modal opened={opened} onClose={onClose} title="Продукты для списания" size="xl">
    <Text size="sm" c="dimmed" mb="md">Партии с истёкшим сроком годности. Списание выполняется автоматически. Неизвестные исторические значения отмечены прочерком. Время — Москва.</Text>
    <StatisticsFeedback query={query} />
    {!query.isError && query.currentData && <WriteOffsTable items={query.currentData} />}
  </Modal>;
}
