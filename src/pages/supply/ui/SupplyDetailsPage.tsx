import { useState } from "react";
import { Group, Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useSupplies } from "../model/SuppliesProvider";
import { getSupplyStatistics } from "../model/statistics";
import { SupplyReceiver } from "./components/SupplyReceiver";
import { SupplyReportButton } from "./components/SupplyReportButton";
import { SupplyProductsTable } from "./components/SupplyProductsTable";
import classes from "./components/SupplyHeader.module.css";

export function SupplyDetailsPage() {
  const { supplyId } = useParams();
  const { supplies } = useSupplies();
  const [searchValue, setSearchValue] = useState("");
  const supply = supplies.find((item) => item.id === supplyId);
  const breadcrumbs = (
    <PageBreadcrumbs
      parentLabel="Поставки"
      parentPath="/supply"
      currentLabel={supply ? `Поставка ${supply.id}` : "Поставка не найдена"}
    />
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
  const items = supply.items.filter((item) =>
    `${item.product.title} ${item.product.article}`
      .toLocaleLowerCase("ru-RU")
      .includes(query),
  );

  return (
    <DefaultPageLayout
      title={`Поставка ${supply.id}`}
      subtitle="Подробная информация о поступлении и составе поставки"
      searchTitle="Поиск продуктов в поставке"
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      statisticData={getSupplyStatistics(supply)}
      disableSearch
      headerTopSection={
        <Group justify="space-between">
          {breadcrumbs}
          <Group gap="sm" className={classes.actions}>
            <SupplyReceiver name={supply.acceptedBy} />
            <SupplyReportButton supply={supply} />
          </Group>
        </Group>
      }
    >
      <Group justify="space-between" style={{ flexShrink: 0 }}>
        <Text fw={600}>Продукты в поставке</Text>
        <Text size="sm" c="dimmed">
          {query
            ? `Найдено: ${items.length} из ${supply.items.length}`
            : `Позиций: ${supply.items.length}`}
        </Text>
      </Group>
      <SupplyProductsTable items={items} />
    </DefaultPageLayout>
  );
}
