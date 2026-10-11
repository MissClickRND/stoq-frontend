import { Alert, Group } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import { Navigate } from "react-router-dom";
import dayjs from "dayjs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { useInventory } from "../../model/InventoryProvider";
import { getInventoryReportStatistics } from "../../model/inventory-statistics";
import { inventoryChange } from "../../model/inventory";
import { InventorySteps } from "./InventorySteps";
import { InventoryChangesTable } from "./InventoryChangesTable";
import { InventoryReportButton } from "./InventoryReportButton";
import classes from "./Inventory.module.css";

export function InventoryReportPage() {
  const { report } = useInventory();
  if (!report) return <Navigate to="/store/inventory" replace />;
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
