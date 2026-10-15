import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Center,
  Loader,
  Group,
  Tooltip,
} from "@mantine/core";
import { apiErrorMessage } from "@/shared/lib/api-error";
import {
  IconCheck,
  IconCoins,
  IconPlus,
  IconShoppingCart,
  IconQrcode,
  IconCancel,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { TableSummary } from "@/shared/ui/table-summary/index";
import { useOrders } from "@/entities/order";

import { OrdersTable } from "./components/OrdersTable";
import { GuestOrderQrModal } from "@/features/share-guest-menu";
import { selectUser, fullAccessRoles } from "@/entities/user";
import { useAppSelector } from "@/shared/lib";
import { useGetOrderStatisticQuery } from "@/entities/statistic";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";

export function OrdersPage() {
  const user = useAppSelector(selectUser);
  const canViewStatistics = Boolean(user.role && fullAccessRoles.includes(user.role));
  const { data } = useGetOrderStatisticQuery(undefined, { skip: !canViewStatistics });
  const initialRestaurant = { id: String(user.restaurantId) };
  const { orders, completeOrder, rejectOrder, isUpdating, isLoading, isError, refetch } = useOrders();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const onComplete = async (id: string) => {
    if (isUpdating) return;
    setActionError(null);
    try {
      await completeOrder(id);
    } catch (error) {
      setActionError(apiErrorMessage(error, "Не удалось завершить заказ"));
    }
  };
  const [search, setSearch] = useState("");
  const [sharing, setSharing] = useState(false);

  const statistics = [
    {
      title: "Всего заказов",
      value: data?.total ?? 0,
      description: "За сегодня",
      icon: <IconShoppingCart />,
      color: "#0d5e24",
    },
    {
      title: "Выполнено",
      value: data?.completed ?? 0,
      description: "За сегодня",
      icon: <IconCheck />,
      color: "#0f8c14",
    },
    {
      title: "Выручка за сегодня",
      value: data?.revenue ?? 0,
      valueFontSize: 24,
      description: "По выполненным заказам",
      icon: <IconCoins />,
      color: "#a15d10",
    },
    {
      title: "Отмененные",
      value: data?.cancelled ?? 0,
      description: "Отмененных заказов за сегодня",
      icon: <IconCancel />,
      color: "#526877",
    },
  ];
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const filtered = orders.filter((order) =>
    `${order.id} ${order.responsible} ${order.type === "dine-in" ? `Стол ${order.table}` : "На вынос"} ${order.items.map((item) => item.name).join(" ")}`
      .toLocaleLowerCase("ru-RU")
      .includes(query),
  );
  return (
    <>
      <DefaultPageLayout
        title="Заказы"
        subtitle="Учёт и обработка заказов ресторана"
        searchTitle="Поиск по номеру заказа, блюду или сотруднику"
        searchValue={search}
        setSearchValue={setSearch}
        statisticData={statistics}
        disableStatistics={!canViewStatistics}
      >
        <TableSummary
          count={filtered.length}
          description="Общее количество заказов"
          action={
            <Group gap="sm">
              <Button
                component={Link}
                to="/orders/new"
                size="lg"
                leftSection={<IconPlus size={20} />}
              >
                Создать заказ
              </Button>
              <Tooltip label="Гостевой заказ по QR">
                <ActionIcon
                  size="input-lg"
                  variant="default"
                  aria-label="Открыть QR гостевого меню"
                  onClick={() => setSharing(true)}
                >
                  <IconQrcode size={24} />
                </ActionIcon>
              </Tooltip>
            </Group>
          }
        />
        {isError && (
          <Alert color="red">
            Не удалось загрузить заказы.{" "}
            <Button variant="subtle" onClick={refetch}>
              Повторить
            </Button>
          </Alert>
        )}
        {actionError && <Alert color="red">{actionError}</Alert>}
        {isLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : (
          !isError && <OrdersTable orders={filtered} onComplete={onComplete} busy={isUpdating}
            onReject={id => { setActionError(null); setRejectingId(id); }} />
        )}
      </DefaultPageLayout>
      <ConfirmationModal opened={Boolean(rejectingId)} title="Отклонить заказ"
        message={`Отклонить заказ №${rejectingId ?? ""}?`}
        warning={actionError ?? "Списанные продукты автоматически не возвращаются на склад."}
        confirmText="Отклонить" cancelText="Отмена" loading={isUpdating}
        onClose={() => { if (!isUpdating) setRejectingId(null); }}
        onConfirm={async () => {
          if (!rejectingId || isUpdating) return;
          setActionError(null);
          try { await rejectOrder(rejectingId); setRejectingId(null); }
          catch (error) { setActionError(apiErrorMessage(error, "Не удалось отклонить заказ")); }
        }} />
      <GuestOrderQrModal
        opened={sharing}
        onClose={() => setSharing(false)}
        restaurantId={initialRestaurant.id}
      />
    </>
  );
}
