import { useState } from "react";
import { Button } from "@mantine/core";
import {
  IconCheck,
  IconClock,
  IconCoins,
  IconPlus,
  IconShoppingCart,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { TableSummary } from "@/shared/ui/table-summary";
import { useOrders } from "./model/OrdersProvider";
import { getTodayOrderStatistics } from "./model/calculations";
import { formatOrderMoney } from "./model/format";
import { OrdersTable } from "./ui/components/OrdersTable";

export function OrdersPage() {
  const { orders, completeOrder } = useOrders();
  const [search, setSearch] = useState("");
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
        description="Общее количество заказов за сегодня"
        action={
          <Button
            component={Link}
            to="/orders/new"
            size="lg"
            leftSection={<IconPlus size={20} />}
          >
            Создать заказ
          </Button>
        }
      />
      <OrdersTable orders={filtered} onComplete={completeOrder} />
    </DefaultPageLayout>
  );
}
