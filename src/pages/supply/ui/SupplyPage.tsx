import { useDebouncedValue } from "@mantine/hooks";
import { normalizeArticle } from "@/shared/lib/format";
import { createElement, useState } from "react";
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Table,
  Text,
} from "@mantine/core";
import {
  IconChevronRight,
  IconCoins,
  IconPackage,
  IconPlus,
  IconReceipt,
  IconTruckDelivery,
  IconPencil,
  IconCheck,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import DefaultPageLayout from "@/widgets/default-page-layout";
import TableLayout from "@/shared/ui/table-layout";
import dayjs from "dayjs";
import {
  getMonthStatistics,
  supplyTotal,
  formatMoney,
  useGetSuppliesQuery,
} from "@/entities/supply";
import {
  supplyColumns,
  supplyStatusColors,
  supplyStatusTranslate,
} from "../model/config";

import { TableSummary } from "@/shared/ui/table-summary";

export function SupplyPage() {
  const [searchValue, setSearchValue] = useState("");
  const [search] = useDebouncedValue(searchValue.trim(), 200);
  const all = useGetSuppliesQuery({ search: "" });
  const searched = useGetSuppliesQuery({ search }, { skip: !search });
  const listing = search ? searched : all;
  const supplies = all.currentData ?? [];
  const filtered = listing.currentData ?? [];
  const now = dayjs();
  const monthly = getMonthStatistics(supplies, now.format("YYYY-MM"));
  const period = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  })
    .format(now.toDate())
    .replace(/\s*г\.$/u, "");
  const statistics = [
    {
      title: "Всего поставок",
      value: monthly.count,
      description: "В этом месяце",
      icon: createElement(IconTruckDelivery),
      color: "#0d5e24",
    },

    {
      title: "Получено продуктов",
      value: monthly.products,
      description: "Позиций за месяц",
      icon: createElement(IconPackage),
      color: "#0b7c86",
    },
    {
      title: "Общая сумма",
      value: formatMoney(monthly.total),
      valueFontSize: 24,
      description: "Стоимость продуктов за месяц",
      icon: createElement(IconCoins),
      color: "#a15d10",
    },
    {
      title: "Средняя стоимость",
      value: formatMoney(monthly.average),
      valueFontSize: 24,
      description: "Поставки в этом месяце",
      icon: createElement(IconReceipt),
      color: "#526877",
    },
  ];

  return (
    <>
      <DefaultPageLayout
        title="Поставки"
        subtitle="Учёт поступлений и контроль приёмки продуктов"
        searchTitle="Поиск по номеру поставки или продукту"
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        statisticData={statistics}
      >
        <TableSummary
          count={filtered.length}
          description={`Статистика за ${period}`}
          action={
            <Button
              component={Link}
              to="/supply/new"
              size="lg"
              leftSection={<IconPlus size={20} />}
            >
              Создать поставку
            </Button>
          }
        />
        {listing.isError && (
          <Alert color="red" title="Не удалось загрузить поставки">
            <Button variant="subtle" onClick={() => listing.refetch()}>
              Повторить
            </Button>
          </Alert>
        )}
        {listing.isFetching && !listing.currentData && (
          <Center p="xl">
            <Loader />
          </Center>
        )}
        {!listing.isError && !(listing.isFetching && !listing.currentData) && (
          <TableLayout
            columns={supplyColumns}
            data={filtered}
            getRowKey={(supply) => supply.id}
            minWidth={1040}
            emptyText="Поставки не найдены. Попробуйте изменить поиск."
            renderRow={(supply) => (
              <Table.Tr>
                <Table.Td>
                  <Text fw={600} size="lg" style={{ whiteSpace: "nowrap" }}>
                    {supply.supplyNumber}
                  </Text>
                  <Text size="sm" c="dimmed">
                    ID {normalizeArticle(supply.id)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={600} size="lg">
                    {supply.supplier || "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="lg" fw={500}>
                    {dayjs(supply.receivedAt).format("DD.MM.YYYY")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {dayjs(supply.receivedAt).format("HH:mm")}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="lg" fw={700}>
                    {supply.items?.length ?? 0}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={700} size="lg" style={{ whiteSpace: "nowrap" }}>
                    {formatMoney(supplyTotal(supply))}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <Avatar size="md" color="gray" radius="xl">
                      {(supply.acceptedBy || "Пользователь")
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </Avatar>
                    <Text size="lg" fw={500}>
                      {supply.acceptedBy || "Пользователь"}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge size="lg" color={supplyStatusColors[supply.status]}>
                    {supplyStatusTranslate[supply.status]}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <ActionIcon
                      component={Link}
                      to={`/supply/${supply.id}/edit`}
                      variant="default"
                      size="50"
                      aria-label={`Редактировать поставку ${supply.supplyNumber}`}
                    >
                      <IconPencil size={20} />
                    </ActionIcon>

                    <Button
                      component={Link}
                      to={`/supply/${encodeURIComponent(supply.id)}`}
                      variant="default"
                      size="lg"
                      rightSection={<IconChevronRight size={20} />}
                    >
                      Подробнее
                    </Button>
                    {supply.status === "IN_TRANSIT" && (
                      <ActionIcon
                        component={Link}
                        to={`/supply/${supply.id}/edit?accept=1`}
                        size="50"
                      >
                        <IconCheck />
                      </ActionIcon>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            )}
          />
        )}
      </DefaultPageLayout>
    </>
  );
}
