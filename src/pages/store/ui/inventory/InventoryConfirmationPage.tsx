import { Button, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import dayjs from "dayjs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { useInventory, InventorySteps } from "@/features/inventory";
import { getInventoryConfirmationStatistics } from "../../model/inventory-statistics";
import { inventoryChange, InventoryChangesTable } from "@/entities/inventory";

import classes from "../../classes/Inventory.module.css";

export function InventoryConfirmationPage() {
  const { entries, ready, date, save } = useInventory();
  const name = useSelector((state: RootState) => state.user.name);
  if (!ready || !date) return <Navigate to="/store/inventory" replace />;
  const sorted = [...entries].sort(
    (a, b) =>
      Number(inventoryChange(a) === "unchanged") -
      Number(inventoryChange(b) === "unchanged"),
  );
  return (
    <DefaultPageLayout
      title="Подтверждение инвентаризации"
      subtitle={`Проверьте изменения перед сохранением · ${dayjs(date).format("DD.MM.YYYY")}`}
      disableSearch
      statisticData={getInventoryConfirmationStatistics(entries)}
      beforeStatistics={<InventorySteps active={1} />}
      headerTopSection={
        <PageBreadcrumbs
          parentLabel="Инвентаризация"
          parentPath="/store/inventory"
          currentLabel="Подтверждение изменений"
        />
      }
    >
      <Text size="sm" c="dimmed" className={classes.fixed}>
        Остатки и удаления будут применены после нажатия «Сохранить». Для
        исправления вернитесь к проверке через хлебные крошки.
      </Text>
      <InventoryChangesTable entries={sorted} />
      <Button
        className={classes.footer}
        size="lg"
        fullWidth
        leftSection={<IconCheck size={20} />}
        onClick={() => {
          save(name || "Пользователь");
          //! Открыть итоговый отчёт по ID, полученному после сохранения на сервере.
        }}
      >
        Сохранить
      </Button>
    </DefaultPageLayout>
  );
}
