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
import { IconShoppingCart } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { apiErrorMessage } from "@/shared/lib/api-error";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { validateOrderDraft, formatOrderMoney } from "@/entities/order";

import { useGuestOrder } from "@/features/guest-order";
import { GuestCartItems } from "../components/GuestCartItems/GuestCartItems";
import classes from "../../classes/Guest.module.css";

export function GuestCartPage() {
  const {
    basePath,
    items,
    total,
    details,
    updateDetails,
    submitOrder,
    isSubmitting,
  } = useGuestOrder();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const errors = submitted
    ? validateOrderDraft({
        ...details,
        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        items,
      })
    : {};
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setSubmitted(true);
    setMessage(null);
    try {
      const order = await submitOrder();
      navigate(`${basePath}/complete?orderId=${encodeURIComponent(order.id)}`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : apiErrorMessage(
              error,
              "Не удалось создать заказ. Попробуйте ещё раз.",
            ),
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
            aria-busy={isSubmitting}
            noValidate
          >
            <Stack gap="lg">
              {message && (
                <Alert color="red" role="alert">
                  {message}
                </Alert>
              )}
              <Stack gap="0">
                <Text size="lg" fw={700}>
                  Оформление заказа
                </Text>
                <Text size="sm" c="dimmed">
                  Заполните информацию о заказе
                </Text>
              </Stack>
              <fieldset
                className={componentClasses.checkoutFields}
                disabled={isSubmitting}
                style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
              >
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
              </fieldset>

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
                loading={isSubmitting}
                leftSection={<IconShoppingCart size={20} />}
              >
                Оформить заказ
              </Button>
            </Stack>
          </Paper>
        </div>
      )}
    </Stack>
  );
}

import { OrderGuestFields } from "@/features/order-editor";
