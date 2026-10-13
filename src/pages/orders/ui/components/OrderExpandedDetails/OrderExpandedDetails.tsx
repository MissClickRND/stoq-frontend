import componentClasses from "./OrderExpandedDetails.module.css";
import { Button, Group, Paper, Stack, Table, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import TableLayout from "@/shared/ui/table-layout";
import { formatOrderMoney, type Order } from "@/entities/order";

export function OrderExpandedDetails({
  order,
  onComplete,
}: {
  order: Order;
  onComplete: () => void;
}) {
  return (
    <div className={componentClasses.detailsBody}>
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
                {formatOrderMoney(item.totalPrice ?? null)}
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      />
      <Paper withBorder p="lg" className={componentClasses.detailsInfo}>
        <Stack gap="sm">
          <div>
            <Text size="sm" c="dimmed">
              Сумма заказа
            </Text>
            <Text size="xl" fw={700}>
              {formatOrderMoney(order.totalPrice)}
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
