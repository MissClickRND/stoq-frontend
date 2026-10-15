import { Modal, Table, Text, ScrollArea, Button, Group, Alert } from "@mantine/core";
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useDisposeStoreBatchMutation } from '@/entities/store';
import { apiErrorMessage } from '@/shared/lib/api-error';
import {
  useGetWriteOffsQuery,
  statisticsQueryOptions,
  type WriteOff,
} from "@/entities/statistic";
import { StatisticsFeedback } from "@/shared/ui/statistics-feedback";
const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })
    : "—";

export function WriteOffsTable({ items, onDelete, deletingId }: { items: WriteOff[]; onDelete?: (item: WriteOff) => void; deletingId?: number }) {
  if (!items.length)
    return (
      <Text c="dimmed" py="lg">
        Просроченных партий нет
      </Text>
    );
  return (
    <ScrollArea>
      <Table miw={720}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Продукт</Table.Th>
            <Table.Th>Партия</Table.Th>
            <Table.Th>Списано</Table.Th>
            <Table.Th>Срок годности истёк</Table.Th>
            <Table.Th>Автоматически списано</Table.Th>
            {onDelete && <Table.Th>Действия</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <Table.Tr key={item.batchId}>
              <Table.Td>{item.product.name}</Table.Td>
              <Table.Td>№ {item.batchId}</Table.Td>
              <Table.Td>
                {item.writtenOffQuantity == null
                  ? "—"
                  : `${item.writtenOffQuantity.toLocaleString("ru-RU", { maximumFractionDigits: 3 })} ${item.product.unit?.shortName ?? ""}`}
              </Table.Td>
              <Table.Td>{date(item.expiresAt)}</Table.Td>
              <Table.Td>{date(item.writtenOffAt)}</Table.Td>
              {onDelete && <Table.Td><Button color="red" variant="light" size="xs" loading={deletingId === item.batchId} disabled={deletingId != null && deletingId !== item.batchId} onClick={() => onDelete(item)}>Удалить продукт</Button></Table.Td>}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

export function WriteOffsModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<WriteOff | null>(null);
  const [dispose, disposal] = useDisposeStoreBatchMutation();
  const query = useGetWriteOffsQuery(undefined, {
    ...statisticsQueryOptions,
    skip: !opened,
  });
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Продукты для списания"
      size={900}
    >
      <Text size="sm" c="dimmed" mb="md">
        Продукты которые были списаны и их необходимо выбросить
      </Text>
      {selected && <Alert color="orange" mb="md" title={`Утилизирована партия №${selected.batchId}?`}>
        <Text size="sm">{selected.product.name}: удалите из списка после утилизации. История списания сохранится.</Text>
        <Group mt="sm"><Button color="red" loading={disposal.isLoading} onClick={async () => {
          try { await dispose({ batchId: selected.batchId }).unwrap(); setSelected(null); notifications.show({ color: 'green', message: 'Продукт удалён из списка просрочки' }); }
          catch (error) { notifications.show({ color: 'red', message: apiErrorMessage(error, 'Не удалось удалить продукт') }); }
        }}>Удалить продукт</Button><Button variant="default" disabled={disposal.isLoading} onClick={() => setSelected(null)}>Отмена</Button></Group>
      </Alert>}
      <StatisticsFeedback query={query} />
      {!query.isError && query.currentData && (
        <WriteOffsTable items={query.currentData} onDelete={setSelected} deletingId={disposal.isLoading ? selected?.batchId : undefined} />
      )}
    </Modal>
  );
}
