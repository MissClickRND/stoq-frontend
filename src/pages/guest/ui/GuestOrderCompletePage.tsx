import { Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Navigate } from "react-router-dom";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { formatOrderMoney } from "@/pages/orders/model/format";
import { useGuestOrder } from "../model/GuestOrderProvider";
import classes from "./Guest.module.css";

export function GuestOrderCompletePage() {
  const { basePath, lastOrder } = useGuestOrder();
  if (!lastOrder) return <Navigate to={basePath} replace />;
  return (
    <Stack>
      <PageBreadcrumbs
        parentLabel="Меню"
        parentPath={basePath}
        currentLabel="Заказ сформирован"
      />
      <Paper withBorder p="xl" className={classes.success}>
        <Stack align="center" gap="lg">
          <ThemeIcon size={76} radius="xl" variant="light">
            <IconCheck size={40} />
          </ThemeIcon>
          <Title order={1} className={classes.title}>
            Заказ сформирован
          </Title>
          <Text c="dimmed">
            Это демонстрация гостевого заказа. Заказ не отправлен в ресторан.
          </Text>
          <Text size="xl" fw={700}>
            {formatOrderMoney(lastOrder.total)}
          </Text>
          <Group justify="center">
            <Text>Позиций: {lastOrder.items.length}</Text>
            <Text>
              {lastOrder.type === "dine-in"
                ? `Стол ${lastOrder.table}`
                : "На вынос"}
            </Text>
            <Text>Гостей: {lastOrder.guests}</Text>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
