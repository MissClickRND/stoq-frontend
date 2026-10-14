import componentClasses from "./GuestOrderCompletePage.module.css";
import {
  Alert,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Link, useSearchParams } from "react-router-dom";
import { IconCheck } from "@tabler/icons-react";
import { useGuestOrderResult, formatOrderMoney } from "@/entities/order";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";

import { useGuestOrder } from "@/features/guest-order";
import classes from "../../classes/Guest.module.css";

export function GuestOrderCompletePage() {
  const { basePath, lastOrder: savedOrder } = useGuestOrder();
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const localOrder = savedOrder?.id === orderId ? savedOrder : null;
  const result = useGuestOrderResult(orderId, { skip: Boolean(localOrder) });
  const lastOrder = localOrder ?? result.order;
  if (!lastOrder) {
    return (
      <Stack>
        <PageBreadcrumbs
          parentLabel="Меню"
          parentPath={basePath}
          currentLabel="Результат заказа"
        />
        {result.isLoading ? (
          <Center role="status" aria-label="Загрузка заказа">
            <Loader />
          </Center>
        ) : result.isError ? (
          <Alert color="red" role="alert">
            Не удалось загрузить заказ.
            <Button variant="subtle" onClick={() => result.refetch()}>
              Повторить
            </Button>
          </Alert>
        ) : (
          <Paper withBorder p="xl">
            <Text>Заказ не найден. Оформите заказ из корзины.</Text>
          </Paper>
        )}
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
