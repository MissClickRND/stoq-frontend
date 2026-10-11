import { Alert, Group } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import dayjs from "dayjs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import {
  useInventoryReport,
  inventoryChange,
  InventoryChangesTable,
} from "@/entities/inventory";
import { getInventoryReportStatistics } from "../../model/inventory-statistics";

import { InventorySteps } from "@/features/inventory";

import { InventoryReportButton } from "@/features/export-report";
import classes from "../../classes/Inventory.module.css";

export function InventoryReportPage() {
  const { report } = useInventoryReport();
  const sorted = [...report.entries].sort(
    (a, b) =>
      Number(inventoryChange(a) === "unchanged") -
      Number(inventoryChange(b) === "unchanged"),
  );
  return (
    <DefaultPageLayout
      title="Итоговый отчёт инвентаризации"
      subtitle={`Проверка за ${dayjs(report.date).format("DD.MM.YYYY")} завершена`}
      disableSearch
      statisticData={getInventoryReportStatistics(report)}
      beforeStatistics={<InventorySteps active={3} />}
      headerTopSection={
        <PageBreadcrumbs
          parentLabel="Склад"
          parentPath="/store"
          currentLabel="Итоговый отчёт инвентаризации"
        />
      }
    >
      <InventoryChangesTable entries={sorted} applied />
      <Alert
        color="green"
        icon={<IconCircleCheck size={24} />}
        title="Инвентаризация завершена"
        className={classes.fixed}
      >
        Изменения сохранены. Провёл: {report.completedBy}. Без изменений:{" "}
        {report.counts.unchanged} позиций.
      </Alert>
      <Group className={classes.footer} justify="flex-end">
        <InventoryReportButton report={report} />
      </Group>
    </DefaultPageLayout>
  );
}
