import { Fragment, useState } from "react";
import { Button, Table, Text } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import dayjs from "dayjs";
import TableLayout from "@/shared/ui/table-layout";
import { orderColumns } from "../../model/config";
import { formatOrderMoney, type Order } from "@/entities/order";

import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderExpandedDetails } from "./OrderExpandedDetails/OrderExpandedDetails";

export function OrdersTable({
  orders,
  onComplete,
}: {
  orders: Order[];
  onComplete: (id: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <TableLayout
      columns={orderColumns}
      data={orders}
      getRowKey={(order) => order.id}
      minWidth={1340}
      emptyText="Заказы не найдены"
      renderRow={(order) => {
        const expanded = expandedId === order.id;
        return (
          <Fragment>
            <Table.Tr>
              <Table.Td>
                <Text size="lg" fw={600} style={{ whiteSpace: "nowrap" }}>
                  #{order.id}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="lg">
                  {dayjs(order.createdAt).format("DD.MM.YYYY")}
                </Text>
                <Text size="sm" c="dimmed">
                  {dayjs(order.createdAt).format("HH:mm")}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="lg" fw={700}>
                  {order.items.length} блюда
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
                  {formatOrderMoney(order.totalPrice)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="lg" fw={500}>
                  {order.type === "dine-in"
                    ? `Стол ${order.table}`
                    : "На вынос"}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="lg" fw={500}>
                  {order.responsible}
                </Text>
              </Table.Td>
              <Table.Td>
                <OrderStatusBadge status={order.status} />
              </Table.Td>
              <Table.Td>
                <Button
                  size="lg"
                  variant="default"
                  aria-expanded={expanded}
                  aria-controls={`order-details-${order.id}`}
                  rightSection={
                    expanded ? (
                      <IconChevronUp size={20} />
                    ) : (
                      <IconChevronDown size={20} />
                    )
                  }
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                >
                  {expanded ? "Скрыть" : "Подробнее"}
                </Button>
              </Table.Td>
            </Table.Tr>
            {expanded && (
              <Table.Tr id={`order-details-${order.id}`}>
                <Table.Td colSpan={orderColumns.length}>
                  <OrderExpandedDetails
                    order={order}
                    onComplete={() => onComplete(order.id)}
                  />
                </Table.Td>
              </Table.Tr>
            )}
          </Fragment>
        );
      }}
    />
  );
}
