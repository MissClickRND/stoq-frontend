import { Table, Text } from "@mantine/core";
import TableLayout from "@/shared/ui/table-layout";
import { formatMoney, formatDateTime, SupplyItem } from "@/entities/supply";

const columns = [
  "Артикул",
  "Продукт",
  "Количество",
  "Ед. измерения",
  "Цена за ед.",
  "Сумма",
  "Срок годности",
];

export function SupplyProductsTable({ items }: { items: SupplyItem[] }) {
  return (
    <TableLayout
      columns={columns}
      data={items}
      getRowKey={(item) => item.id}
      minWidth={1000}
      emptyText="Продукты не найдены"
      renderRow={(item) => (
        <Table.Tr>
          <Table.Td>
            <Text size="lg" c="dimmed">
              {item.product.article}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={600}>
              {item.product.title}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={700}>
              {item.quantity.toLocaleString("ru-RU", {
                maximumFractionDigits: 3,
              })}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={500}>
              {item.unit}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={600} style={{ whiteSpace: "nowrap" }}>
              {formatMoney(item.unitPrice)}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
              {formatMoney(item.total)}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={500} style={{ whiteSpace: "nowrap" }}>
              {formatDateTime(item.expiresAt)}
            </Text>
          </Table.Td>
        </Table.Tr>
      )}
    />
  );
}
