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
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconShoppingCart,
  IconUser,
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
          Проверьте выбранные блюда и укажите детали заказа
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
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size={42} variant="light" color="gray" radius="xl">
                  <IconUser size={24} />
                </ThemeIcon>
                <div>
                  <Text size="lg" fw={700}>
                    Ваш заказ
                  </Text>
                  <Text size="sm" c="dimmed">
                    Как и куда подать блюда
                  </Text>
                </div>
              </Group>
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
              <TextInput
                size="lg"
                label="Имя гостя"
                description="Необязательно"
                placeholder="Как к вам обращаться?"
                maxLength={80}
                value={details.guestName}
                onChange={(event) =>
                  updateDetails({ guestName: event.currentTarget.value })
                }
              />
              <Textarea
                size="lg"
                label="Комментарий к заказу"
                placeholder="Например, без лука, пожалуйста"
                minRows={3}
                maxLength={500}
                value={details.comment}
                onChange={(event) =>
                  updateDetails({ comment: event.currentTarget.value })
                }
              />
              <Text size="xs" c="dimmed" ta="right">
                {details.comment.length}/500
              </Text>
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
              <Alert color="blue" icon={<IconInfoCircle size={20} />}>
                Демонстрационный режим: заказ не отправляется в ресторан.
              </Alert>
              {message && (
                <Alert color="red" role="alert">
                  {message}
                </Alert>
              )}
              <Button
                type="submit"
                size="lg"
                fullWidth
                leftSection={<IconShoppingCart size={20} />}
              >
                Создать заказ
              </Button>
            </Stack>
          </Paper>
        </div>
      )}
    </Stack>
  );
}

import { OrderGuestFields } from "@/features/order-editor";
