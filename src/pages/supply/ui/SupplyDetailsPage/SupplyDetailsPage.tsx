import { useGetSupplyDetailsStatisticQuery, statisticsQueryOptions } from "@/entities/statistic";
import { StatisticsFeedback } from "@/shared/ui/statistics-feedback";
import { supplyProductName, supplyProductReference } from "@/entities/supply";
import componentClasses from "./SupplyDetailsPage.module.css";
import { useState } from "react";
import { Alert, Button, Center, Group, Loader, Text } from "@mantine/core";
import { skipToken } from "@reduxjs/toolkit/query";
import { Link, useParams } from "react-router-dom";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useGetSupplyByIdQuery } from "@/entities/supply";
import { getSupplyStatistics } from "../../model/statistics";
import { SupplyReceiver } from "../components/SupplyReceiver/SupplyReceiver";
import { SupplyReportButton } from "@/features/export-report";
import { SupplyProductsTable } from "../components/SupplyProductsTable";
import { IconArrowLeft } from "@tabler/icons-react";

export function SupplyDetailsPage() {
  const { supplyId } = useParams();
  const id = Number(supplyId);
  const validId =
    Number.isSafeInteger(id) && id > 0 && /^\d+$/.test(supplyId ?? "");
  const {
    currentData: supply,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSupplyByIdQuery(validId ? { id } : skipToken);
  const statistic = useGetSupplyDetailsStatisticQuery(validId ? id : skipToken, statisticsQueryOptions);
  const [searchValue, setSearchValue] = useState("");
  const breadcrumbs = (
    <PageBreadcrumbs
      parentLabel="Поставки"
      parentPath="/supply"
      currentLabel={
        supply ? `Поставка ${supply.supplyNumber}` : "Поставка не найдена"
      }
    />
  );

  if (validId && isFetching && !supply)
    return (
      <DefaultPageLayout
        title="Загрузка поставки"
        subtitle="Получаем данные поставки"
        disableSearch
        disableStatistics
        headerTopSection={breadcrumbs}
      >
        <Center p="xl">
          <Loader />
        </Center>
      </DefaultPageLayout>
    );
  if (isError && !(error && "status" in error && error.status === 404))
    return (
      <DefaultPageLayout
        title="Поставка"
        subtitle="Подробная информация о поступлении"
        disableSearch
        disableStatistics
        headerTopSection={breadcrumbs}
      >
        <Alert color="red" title="Не удалось загрузить поставку">
          <Button variant="subtle" onClick={() => refetch()}>
            Повторить
          </Button>
        </Alert>
      </DefaultPageLayout>
    );
  if (!supply)
    return (
      <DefaultPageLayout
        title="Поставка не найдена"
        subtitle="Проверьте адрес или вернитесь к списку поставок"
        disableSearch
        disableStatistics
        headerTopSection={breadcrumbs}
      />
    );

  const query = searchValue.trim().toLocaleLowerCase("ru-RU");
  const items = (supply.items ?? []).filter((item) =>
    `${supplyProductName(item.product)} ${supplyProductReference(item.product)}`
      .toLocaleLowerCase("ru-RU")
      .includes(query),
  );

  return (
    <DefaultPageLayout
      title={`Поставка ${supply.supplyNumber}`}
      subtitle="Подробная информация о поступлении и составе поставки"
      searchTitle="Поиск продуктов в поставке"
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      statisticData={getSupplyStatistics(statistic.isError ? undefined : statistic.currentData)}
      headerTopSection={
        <Group justify="space-between">
          {breadcrumbs}
          <Group gap="sm" className={componentClasses.actions}>
            <SupplyReceiver name={supply.acceptedBy || "Пользователь"} />
            <SupplyReportButton supply={supply} />
          </Group>
        </Group>
      }
    >
      <StatisticsFeedback query={statistic} />
      <Group justify="space-between" style={{ flexShrink: 0 }}>
        <Text>Поставщик: {supply.supplier || "—"}</Text>
        <Text fw={600}>Продукты в поставке</Text>
        <Text size="sm" c="dimmed">
          {query
            ? `Найдено: ${items.length} из ${supply.items?.length ?? 0}`
            : `Позиций: ${supply.items.length}`}
        </Text>
      </Group>
      <SupplyProductsTable items={items} />
      <Button
        component={Link}
        to="/supply"
        variant="default"
        size="lg"
        style={{ alignSelf: "flex-start" }}
        leftSection={<IconArrowLeft />}
      >
        Вернуться к поставкам
      </Button>
    </DefaultPageLayout>
  );
}
