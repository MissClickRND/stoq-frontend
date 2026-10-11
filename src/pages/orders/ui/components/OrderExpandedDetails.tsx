import { Button, Group, Paper, Stack, Table, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import TableLayout from "@/widgets/table-layout";
import { orderTotal } from "../../model/calculations";
import { formatOrderMoney } from "../../model/format";
import type { Order } from "../../model/type";
import classes from "../Orders.module.css";

export function OrderExpandedDetails({
  order,
  onComplete,
}: {
  order: Order;
  onComplete: () => void;
}) {
  return (
    <div className={classes.detailsBody}>
      <TableLayout
        autoHeight
        fillHeight
        columns={["Блюдо", "Количество", "Цена за ед.", "Сумма"]}
        data={order.items}
        getRowKey={(item) => item.dishId}
        minWidth={650}
        emptyText="В заказе нет блюд"
        renderRow={(item) => (
          <Table.Tr>
            <Table.Td>
              <Text size="lg" fw={600}>
                {item.name}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="lg" fw={700}>
                {item.quantity}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="lg" fw={600} style={{ whiteSpace: "nowrap" }}>
                {formatOrderMoney(item.price)}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
                {formatOrderMoney(orderTotal([item]))}
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      />
      <Paper withBorder p="lg" className={classes.detailsInfo}>
        <Stack gap="sm">
          <div>
            <Text size="sm" c="dimmed">
              Сумма заказа
            </Text>
            <Text size="xl" fw={700}>
              {formatOrderMoney(orderTotal(order.items))}
            </Text>
          </div>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Тип заказа
            </Text>
            <Text size="lg" fw={600}>
              {order.type === "dine-in" ? "В зале" : "На вынос"}
            </Text>
          </Group>
          {order.type === "dine-in" && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Стол
              </Text>
              <Text size="lg" fw={600}>
                {order.table}
              </Text>
            </Group>
          )}
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Гостей
            </Text>
            <Text size="lg" fw={700}>
              {order.guests}
            </Text>
          </Group>
        </Stack>
        {order.status !== "completed" && (
          <Button
            size="lg"
            fullWidth
            mt="auto"
            leftSection={<IconCheck size={20} />}
            onClick={onComplete}
          >
            Завершить заказ
          </Button>
        )}
      </Paper>
    </div>
  );
}
