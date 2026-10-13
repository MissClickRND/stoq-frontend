import { useState } from "react";
import { ActionIcon, Alert, Button, Center, Loader, Group, Tooltip } from "@mantine/core";
import { apiErrorMessage } from '@/shared/lib/api-error';
import {
  IconCheck,
  IconClock,
  IconCoins,
  IconPlus,
  IconShoppingCart,
  IconQrcode,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { TableSummary } from "@/shared/ui/table-summary/index";
import {
  useOrders,
  getTodayOrderStatistics,
  formatOrderMoney,
} from "@/entities/order";

import { OrdersTable } from "./components/OrdersTable";
import { GuestOrderQrModal } from "@/features/share-guest-menu";
import { useRestaurant } from "@/entities/restaurant";

export function OrdersPage() {
  const { restaurant: initialRestaurant } = useRestaurant();
  const { orders, completeOrder, isLoading, isError, refetch } = useOrders();
  const [actionError, setActionError] = useState<string | null>(null);
  const onComplete = async (id: string) => {
    setActionError(null);
    try { await completeOrder(id); }
    catch (error) { setActionError(apiErrorMessage(error, 'Не удалось завершить заказ')); }
  };
  const [search, setSearch] = useState("");
  const [sharing, setSharing] = useState(false);
  const today = getTodayOrderStatistics(orders, dayjs().format("YYYY-MM-DD"));
  const statistics = [
    {
      title: "Всего заказов",
      value: today.total,
      description: "За сегодня",
      icon: <IconShoppingCart />,
      color: "#0d5e24",
    },
    {
      title: "Выполнено",
      value: today.completed,
      description: "За сегодня",
      icon: <IconCheck />,
      color: "#0f8c14",
    },
    {
      title: "Выручка за сегодня",
      value: formatOrderMoney(today.revenue),
      valueFontSize: 24,
      description: "По выполненным заказам",
      icon: <IconCoins />,
      color: "#a15d10",
    },
    {
      title: "В обработке",
      value: today.processing,
      description: "Активных заказов за сегодня",
      icon: <IconClock />,
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
        {isError && <Alert color="red">Не удалось загрузить заказы или меню. <Button variant="subtle" onClick={refetch}>Повторить</Button></Alert>}
        {actionError && <Alert color="red">{actionError}</Alert>}
        {isLoading ? <Center p="xl"><Loader /></Center> : !isError && <OrdersTable orders={filtered} onComplete={onComplete} />}
      </DefaultPageLayout>
      <GuestOrderQrModal
        opened={sharing}
        onClose={() => setSharing(false)}
        restaurantId={initialRestaurant.id}
      />
    </>
  );
}
