import componentClasses from "./InventoryCheckTable.module.css";
import {
  ActionIcon,
  Group,
  NumberInput,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconTrash, IconArrowBackUp } from "@tabler/icons-react";
import TableLayout from "@/shared/ui/table-layout";
import { inventoryEntryError, type InventoryEntry } from "@/entities/inventory";

const columns = [
  "ID поставки",
  "Артикул",
  "Продукт",
  "В системе",
  "Факт",
  "Ед. измерения",
  "Действия",
];

export function InventoryCheckTable({
  entries,
  submitted,
  onChange,
}: {
  entries: InventoryEntry[];
  submitted: boolean;
  onChange: (
    id: string,
    patch: Partial<Pick<InventoryEntry, "actual" | "remove">>,
  ) => void;
}) {
  return (
    <TableLayout
      columns={columns}
      data={entries}
      getRowKey={(entry) => entry.product.id}
      minWidth={1140}
      emptyText="Продукты не найдены"
      renderRow={(entry) => (
        <Table.Tr
          className={entry.remove ? componentClasses.deleted : undefined}
        >
          <Table.Td>
            <Text size="lg" fw={600} style={{ whiteSpace: "nowrap" }}>
              {entry.product.supplyId}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="lg">{entry.product.article}</Text>
          </Table.Td>
          <Table.Td>
            <Text
              size="lg"
              fw={600}
              td={entry.remove ? "line-through" : undefined}
            >
              {entry.product.title}
            </Text>
            {entry.remove && (
              <Text size="sm" c="red">
                Будет удалён после сохранения
              </Text>
            )}
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
              {Number(entry.product.remains).toLocaleString("ru-RU")}{" "}
              {entry.product.units}
            </Text>
          </Table.Td>
          <Table.Td>
            <NumberInput
              size="lg"
              w={150}
              min={0}
              decimalScale={3}
              decimalSeparator=","
              allowNegative={false}
              disabled={entry.remove}
              aria-label={`Фактический остаток ${entry.product.title}, поставка ${entry.product.supplyId}, позиция ${entry.product.id}`}
              value={entry.actual}
              error={submitted ? inventoryEntryError(entry) : undefined}
              styles={{ input: { fontWeight: 700 } }}
              onChange={(actual) => onChange(entry.product.id, { actual })}
            />
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={500}>
              {entry.product.units}
            </Text>
          </Table.Td>
          <Table.Td>
            <Group gap="xs">
              <Tooltip
                label={entry.remove ? "Отменить удаление" : "Удалить позицию"}
              >
                <ActionIcon
                  size="lg"
                  variant="light"
                  color={entry.remove ? "green" : "red"}
                  aria-label={`${entry.remove ? "Отменить удаление" : "Удалить"} позицию ${entry.product.id}`}
                  onClick={() =>
                    onChange(entry.product.id, { remove: !entry.remove })
                  }
                >
                  {entry.remove ? (
                    <IconArrowBackUp size={20} />
                  ) : (
                    <IconTrash size={20} />
                  )}
                </ActionIcon>
              </Tooltip>
            </Group>
          </Table.Td>
        </Table.Tr>
      )}
    />
  );
}
