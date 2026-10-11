import { useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Divider,
  Group,
  NumberInput,
  Paper,
  Select,
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
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { orderTypeOptions, tableOptions } from "@/pages/orders/model/data";
import { validateOrderDraft } from "@/pages/orders/model/calculations";
import type { OrderType } from "@/pages/orders/model/type";
import { formatOrderMoney } from "@/pages/orders/model/format";
import { useGuestOrder } from "../model/GuestOrderProvider";
import { GuestCartItems } from "./components/GuestCartItems";
import classes from "./Guest.module.css";

export function GuestCartPage() {
  const { basePath, items, total, details, updateDetails, submitOrder } =
    useGuestOrder();
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
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    try {
      submitOrder();
      navigate(`${basePath}/complete`, { replace: true });
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
        <div className={classes.cartGrid}>
          <GuestCartItems />
          <Paper
            component="form"
            withBorder
            p="lg"
            className={classes.checkout}
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
              <div className={classes.checkoutFields}>
                <Select
                  size="lg"
                  label="Тип заказа"
                  data={orderTypeOptions}
                  value={details.type}
                  allowDeselect={false}
                  onChange={(value) => {
                    if (value) updateDetails({ type: value as OrderType });
                    setMessage(null);
                  }}
                />
                <Select
                  size="lg"
                  label="Стол"
                  withAsterisk={details.type === "dine-in"}
                  data={tableOptions}
                  value={details.type === "dine-in" ? details.table : null}
                  disabled={details.type === "takeaway"}
                  placeholder={
                    details.type === "takeaway"
                      ? "Не требуется"
                      : "Выберите стол"
                  }
                  error={errors.table}
                  allowDeselect={false}
                  onChange={(table) => {
                    updateDetails({ table });
                    setMessage(null);
                  }}
                />
                <NumberInput
                  size="lg"
                  className={classes.checkoutGuests}
                  label="Количество гостей"
                  value={details.guests}
                  min={1}
                  allowDecimal={false}
                  allowNegative={false}
                  error={errors.guests}
                  onChange={(guests) => {
                    updateDetails({ guests });
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
