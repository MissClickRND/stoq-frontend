import componentClasses from "./GuestOrderCompletePage.module.css";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Link, useSearchParams } from "react-router-dom";
import { IconCheck } from "@tabler/icons-react";
import { formatOrderMoney } from "@/entities/order";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";

import { useGuestOrder } from "@/features/guest-order";
import classes from "../../classes/Guest.module.css";

export function GuestOrderCompletePage() {
  const { basePath, lastOrder: savedOrder } = useGuestOrder();
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const localOrder = savedOrder?.id === orderId ? savedOrder : null;
  const lastOrder = localOrder;
  if (!lastOrder) {
    return (
      <Stack>
        <PageBreadcrumbs
          parentLabel="Меню"
          parentPath={basePath}
          currentLabel="Результат заказа"
        />
        <Paper withBorder p="xl"><Text>Подробности заказа доступны сразу после оформления. Если вы уже отправили заказ, уточните его статус у сотрудника ресторана.</Text></Paper>
        <Button component={Link} to={basePath} variant="default">
          Вернуться в меню
        </Button>
      </Stack>
    );
  }
  return (
    <Stack>
      <PageBreadcrumbs
        parentLabel="Меню"
        parentPath={basePath}
        currentLabel="Заказ сформирован"
      />
      <Paper withBorder p="xl" className={componentClasses.success}>
        <Stack align="center" gap="lg">
          <ThemeIcon size={76} radius="xl" variant="light">
            <IconCheck size={40} />
          </ThemeIcon>
          <Title order={1} className={classes.title}>
            Заказ сформирован
          </Title>
          <Text c="dimmed">Заказ №{lastOrder.id} принят рестораном.</Text>
          <Text size="xl" fw={700}>
            {formatOrderMoney(lastOrder.totalPrice)}
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
          <Button component={Link} to={basePath} variant="default">
            Вернуться в меню
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
