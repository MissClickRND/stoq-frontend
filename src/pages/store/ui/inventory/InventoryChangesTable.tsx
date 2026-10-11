import { Badge, Table, Text } from "@mantine/core";
import TableLayout from "@/widgets/table-layout";
import { inventoryChange } from "../../model/inventory";
import type { InventoryEntry } from "../../model/inventory-type";

export function InventoryChangesTable({
  entries,
  applied = false,
}: {
  entries: InventoryEntry[];
  applied?: boolean;
}) {
  return (
    <TableLayout
      columns={[
        "ID поставки",
        "Артикул",
        "Продукт",
        "Было",
        "Стало",
        "Изменение",
      ]}
      data={entries}
      getRowKey={(entry) => entry.product.id}
      minWidth={1050}
      emptyText="Проверенных позиций нет"
      renderRow={(entry) => {
        const change = inventoryChange(entry);
        const label =
          change === "deleted"
            ? applied
              ? "Удалено"
              : "Удаление"
            : change === "updated"
              ? applied
                ? "Обновлено"
                : "Корректировка"
              : "Без изменений";
        return (
          <Table.Tr>
            <Table.Td>
              <Text size="lg" fw={600} style={{ whiteSpace: "nowrap" }}>
                {entry.product.supplyId}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="lg">{entry.product.article}</Text>
            </Table.Td>
            <Table.Td>
              <Text size="lg" fw={600}>
                {entry.product.title}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
                {Number(entry.product.remains).toLocaleString("ru-RU")}{" "}
                {entry.product.units}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text
                size="lg"
                fw={700}
                c={
                  change === "deleted"
                    ? "red"
                    : change === "updated"
                      ? "primary"
                      : undefined
                }
                style={{ whiteSpace: "nowrap" }}
              >
                {entry.remove
                  ? "—"
                  : `${Number(entry.actual).toLocaleString("ru-RU")} ${entry.product.units}`}
              </Text>
            </Table.Td>
            <Table.Td>
              <Badge
                size="lg"
                variant="light"
                tt="none"
                miw="max-content"
                color={
                  change === "deleted"
                    ? "red"
                    : change === "updated"
                      ? "green"
                      : "gray"
                }
              >
                {label}
              </Badge>
            </Table.Td>
          </Table.Tr>
        );
      }}
    />
  );
}
