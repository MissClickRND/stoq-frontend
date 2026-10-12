import { supplyProductName, supplyProductReference } from "@/entities/supply";
import { Table, Text } from "@mantine/core";
import TableLayout from "@/shared/ui/table-layout";
import { formatMoney, formatDateTime, ISupplyItem } from "@/entities/supply";

const columns = [
  "ID / артикул",
  "Продукт",
  "Количество",
  "Ед. измерения",
  "Цена за ед.",
  "Сумма",
  "Срок годности",
];

export function SupplyProductsTable({ items }: { items: ISupplyItem[] }) {
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
              {supplyProductReference(item.product)}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={600}>
              {supplyProductName(item.product)}
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
              {(item.product?.unit?.shortName ?? "шт.")}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={600} style={{ whiteSpace: "nowrap" }}>
              {formatMoney(0)}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
              {formatMoney(0)}
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
