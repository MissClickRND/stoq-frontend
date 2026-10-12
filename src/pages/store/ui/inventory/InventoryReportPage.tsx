import { Button, Group } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import dayjs from "dayjs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import {
  inventoryChange,
  InventoryChangesTable,
} from "@/entities/inventory";
import { getInventoryReportStatistics } from "../../model/inventory-statistics";

import { Link, Navigate } from "react-router-dom";
import { InventorySteps, useInventoryReport } from "@/features/inventory";

import { InventoryReportButton } from "@/features/export-report";
import classes from "../../classes/Inventory.module.css";

export function InventoryReportPage() {
  const { report } = useInventoryReport();
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
      <Group className={classes.footer} justify="space-between">
        <Button component={Link} to="/store" size="lg" variant="default" leftSection={<IconArrowLeft size={20} />}>
          Вернуться на склад
        </Button>
        <InventoryReportButton report={report} />
      </Group>
    </DefaultPageLayout>
  );
}
