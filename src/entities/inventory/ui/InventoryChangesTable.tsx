import { normalizeArticle } from "@/shared/lib/format";
import { Badge, Table, Text } from "@mantine/core";
import TableLayout from "@/shared/ui/table-layout";
import { inventoryChange } from "../lib/inventory.ts";
import type { InventoryEntry } from "..";

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
              ? "Списано"
              : "Списание"
            : change === "updated"
              ? applied
                ? "Обновлено"
                : "Корректировка"
              : "Без изменений";
        return (
          <Table.Tr>
            <Table.Td>
              <Text size="lg" fw={600} style={{ whiteSpace: "nowrap" }}>
                {normalizeArticle(entry.product.supplyId)}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="lg">{normalizeArticle(entry.product.productId)}</Text>
            </Table.Td>
            <Table.Td>
              <Text size="lg" fw={600}>
                {entry.product.product?.name ??
                  "Продукт #" + entry.product.productId}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
                {entry.product.Quantity.toLocaleString("ru-RU")}{" "}
                {entry.product.product?.unit?.shortName ?? "шт."}
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
                  ? "0 " + (entry.product.product?.unit?.shortName ?? "шт.")
                  : `${Number(entry.actual).toLocaleString("ru-RU")} ${entry.product.product?.unit?.shortName ?? "шт."}`}
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
