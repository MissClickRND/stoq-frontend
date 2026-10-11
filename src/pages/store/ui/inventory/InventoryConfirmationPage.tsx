import { Button, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import type { RootState } from "@/app/providers/store/store";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { useInventory } from "../../model/InventoryProvider";
import { getInventoryConfirmationStatistics } from "../../model/inventory-statistics";
import { inventoryChange } from "../../model/inventory";
import { InventorySteps } from "./InventorySteps";
import { InventoryChangesTable } from "./InventoryChangesTable";
import classes from "./Inventory.module.css";

export function InventoryConfirmationPage() {
  const { entries, ready, date, report, save } = useInventory();
  const name = useSelector((state: RootState) => state.user.name);
  const navigate = useNavigate();
  if (report) return <Navigate to="/store/inventory/report" replace />;
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
          navigate("/store/inventory/report", { replace: true });
        }}
      >
        Сохранить
      </Button>
    </DefaultPageLayout>
  );
}
