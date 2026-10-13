import componentClasses from "./GuestCartPage.module.css";
import { useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconShoppingCart,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { validateOrderDraft, formatOrderMoney } from "@/entities/order";

import { useGuestOrder } from "@/features/guest-order";
import { GuestCartItems } from "../components/GuestCartItems/GuestCartItems";
import classes from "../../classes/Guest.module.css";

export function GuestCartPage() {
  const { basePath, items, total, details, updateDetails, submitOrder } =
    useGuestOrder();
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const errors = submitted
    ? validateOrderDraft({
        ...details,
        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        items,
      })
    : {};
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    try {
      submitOrder();
      //! Перейти к подтверждению только после получения созданного заказа от сервера.
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Проверьте данные заказа",
      );
    }
  };
  return (
    <Stack gap="lg">
      <PageBreadcrumbs
        parentLabel="Меню"
        parentPath={basePath}
        currentLabel="Корзина"
      />
      <div>
        <Title order={1} className={classes.title}>
          Корзина
        </Title>
        <Text c="dimmed" mt="xs">
          Оформите заказ в ресторане самостоятельно
        </Text>
      </div>
      {!items.length ? (
        <Paper withBorder p="xl">
          <Stack align="center" py="xl">
            <ThemeIcon size={64} radius="xl" variant="light" color="gray">
              <IconShoppingCart size={32} />
            </ThemeIcon>
            <Text size="xl" fw={600}>
              Корзина пока пуста
            </Text>
            <Text c="dimmed" ta="center">
              Добавьте блюда из меню — они появятся здесь.
            </Text>
          </Stack>
        </Paper>
      ) : (
        <div className={componentClasses.cartGrid}>
          <GuestCartItems />
          <Paper
            component="form"
            withBorder
            p="lg"
            className={componentClasses.checkout}
            onSubmit={submit}
            noValidate
          >
            <Stack gap="lg">
              {message && <Alert color="red" role="alert">{message}</Alert>}
              <Stack gap="0">
                <Text size="lg" fw={700}>
                  Оформление заказа
                </Text>
                <Text size="sm" c="dimmed">
                  Заполните информацию о заказе
                </Text>
              </Stack>
              <div className={componentClasses.checkoutFields}>
                <OrderGuestFields
                  withIcons={false}
                  value={details}
                  errors={errors}
                  guestsClassName={componentClasses.checkoutGuests}
                  onChange={(patch) => {
                    updateDetails(patch);
                    setMessage(null);
                  }}
                />
              </div>

              <Divider />
              <Group justify="space-between">
                <Text c="dimmed">Количество позиций</Text>
                <Text fw={700}>{items.length}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="lg" fw={700}>
                  Итого
                </Text>
                <Text size="xl" fw={700}>
                  {formatOrderMoney(total)}
                </Text>
              </Group>

              <Button
                type="submit"
                size="lg"
                fullWidth
                leftSection={<IconShoppingCart size={20} />}
              >
                Оплатить
              </Button>
            </Stack>
          </Paper>
        </div>
      )}
    </Stack>
  );
}

import { OrderGuestFields } from "@/features/order-editor";
