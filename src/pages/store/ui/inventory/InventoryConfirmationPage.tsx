import { skipToken } from "@reduxjs/toolkit/query";
import { usePreviewInventoryQuery } from "@/entities/store";
import { toInventoryPreviewRequest } from "@/entities/inventory";
import { StatisticsFeedback } from "@/shared/ui/statistics-feedback";
import { Button, Group, Text } from "@mantine/core";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { useInventory, InventorySteps } from "@/features/inventory";
import { getInventoryConfirmationStatistics } from "../../model/inventory-statistics";
import { inventoryChange, InventoryChangesTable } from "@/entities/inventory";

import { useNotifications } from "@/shared/lib";
import { apiErrorMessage } from "@/shared/lib/api-error";
import classes from "../../classes/Inventory.module.css";

export function InventoryConfirmationPage() {
  const { entries, ready, date, save, isSaving } = useInventory();
  const preview = usePreviewInventoryQuery(ready && entries.length ? toInventoryPreviewRequest(entries) : skipToken, { refetchOnMountOrArgChange: true, pollingInterval: 30000 });
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications("top-right");
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
      statisticData={getInventoryConfirmationStatistics(preview.isError ? undefined : preview.currentData)}
      beforeStatistics={<InventorySteps active={1} />}
      headerTopSection={
        <PageBreadcrumbs
          parentLabel="Инвентаризация"
          parentPath="/store/inventory"
          currentLabel="Подтверждение изменений"
        />
      }
    >
      <StatisticsFeedback query={preview} />
      <Text size="sm" c="dimmed" className={classes.fixed}>
        Остатки и списания будут применены после нажатия «Сохранить». Для
        исправления вернитесь к проверке через хлебные крошки.
      </Text>
      <InventoryChangesTable entries={sorted} />
      <Group className={classes.footer} justify="space-between">
        <Button
          component={Link}
          to="/store"
          variant="default"
          size="lg"
          leftSection={<IconArrowLeft size={20} />}
          disabled={isSaving}
        >
          Вернуться на склад
        </Button>
        <Button
          loading={isSaving}
          disabled={!preview.currentData || preview.isError || preview.isFetching}
          size="lg"
          leftSection={<IconCheck size={20} />}
          onClick={async () => {
            try {
              await save(name || "Пользователь");
              showSuccess("Изменения инвентаризации сохранены.");
              navigate("/store/inventory/report");
            } catch (error) {
              showError(
                error instanceof Error
                  ? error.message
                  : apiErrorMessage(error,
                    "Не удалось сохранить инвентаризацию. Черновик сохранён; повторите попытку.",
                  ),
              );
            }
          }}
        >
          Сохранить
        </Button>
      </Group>
    </DefaultPageLayout>
  );
}
