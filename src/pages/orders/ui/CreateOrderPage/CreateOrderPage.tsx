import componentClasses from "./CreateOrderPage.module.css";
import { useState, type FormEvent } from "react";
import { Alert, Button, Group, Paper, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { useDishes } from "@/entities/dish";
import {
  useOrders,
  addOrderDish,
  orderTotal,
  validateOrderDraft,
  formatOrderMoney,
  type OrderDraft,
} from "@/entities/order";

import { OrderFields, OrderDishesEditor } from "@/features/order-editor";
import { OrderDishSearch } from "../components/OrderDishSearch";

export function CreateOrderPage() {
  const {
    dishes,
    isLoading: dishesLoading,
    isError: dishesError,
    refetch: refetchDishes,
  } = useDishes();
  const { createOrder } = useOrders();
  const name = useSelector((state: RootState) => state.user.name);
  const [draft, setDraft] = useState<OrderDraft>(() => ({
    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    type: "dine-in",
    table: null,
    guests: 1,
    items: [],
  }));
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const errors = submitted ? validateOrderDraft(draft) : {};
  const change = (patch: Partial<OrderDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setMessage(null);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const validation = validateOrderDraft(draft);
    if (Object.keys(validation).length) {
      setMessage(validation.items ?? "Заполните данные заказа.");
      return;
    }
    createOrder({
      createdAt: draft.createdAt!,
      type: draft.type,
      table: draft.type === "dine-in" ? Number(draft.table) : null,
      guests: Number(draft.guests),
      responsible: name || "Пользователь",
      items: draft.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
      })),
    });
    //! Показывать успех и переходить к списку только после ответа сервера.
  };
  return (
    <DefaultPageLayout
      title="Новый заказ"
      subtitle="Выберите желаемые блюда "
      disableSearch
      disableStatistics
      headerTopSection={
        <PageBreadcrumbs
          parentLabel="Заказы"
          parentPath="/orders"
          currentLabel="Новый заказ"
        />
      }
    >
      <Paper
        component="form"
        withBorder
        p="lg"
        className={componentClasses.form}
        onSubmit={submit}
        noValidate
      >
        <OrderFields draft={draft} errors={errors} onChange={change} />
        {message && (
          <Alert
            className={componentClasses.fixed}
            color="red"
            role="alert"
            withCloseButton
            onClose={() => setMessage(null)}
          >
            {message}
          </Alert>
        )}
        <OrderDishesEditor
          items={draft.items}
          submitted={submitted}
          search={
            <OrderDishSearch
              dishes={dishes.filter((dish) => !dish.archived)}
              loading={dishesLoading}
              queryError={dishesError ? (
                <>
                  Не удалось загрузить блюда.
                  <Button
                    type="button"
                    variant="subtle"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => refetchDishes()}
                  >
                    Повторить
                  </Button>
                </>
              ) : undefined}
              onSelect={(dish) => {
                setDraft((current) => ({
                  ...current,
                  items: addOrderDish(current.items, {
                    dishId: dish.id,
                    name: dish.name,
                    price: dish.price,
                    imageUrl: dish.imageUrl,
                  }),
                }));
                setMessage(null);
              }}
            />
          }
          onQuantityChange={(id, quantity) => {
            setDraft((current) => ({
              ...current,
              items: current.items.map((item) =>
                item.dishId === id ? { ...item, quantity } : item,
              ),
            }));
            setMessage(null);
          }}
          onRemove={(id) => {
            setDraft((current) => ({
              ...current,
              items: current.items.filter((item) => item.dishId !== id),
            }));
            setMessage(null);
          }}
        />
        <Group justify="space-between" className={componentClasses.summary}>
          <Group gap="xl">
            <div>
              <Text size="sm" c="dimmed">
                Количество позиций
              </Text>
              <Text size="xl" fw={700}>
                {draft.items.length}
              </Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Сумма заказа
              </Text>
              <Text size="xl" fw={700}>
                {formatOrderMoney(orderTotal(draft.items))}
              </Text>
            </div>
          </Group>
          <Button size="lg" type="submit" leftSection={<IconCheck size={20} />}>
            Создать заказ
          </Button>
        </Group>
      </Paper>
    </DefaultPageLayout>
  );
}
