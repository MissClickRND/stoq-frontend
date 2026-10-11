import { useState } from "react";
import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useNotifications } from "@/shared/lib/hooks/useNotifications";
import {
  getInventoryReportData,
  inventoryReportColumns,
} from "../../model/inventory-report";
import type { InventoryReport } from "../../model/inventory-type";

export function InventoryReportButton({ report }: { report: InventoryReport }) {
  const [loading, setLoading] = useState(false);
  const { showError } = useNotifications();
  const download = async () => {
    setLoading(true);
    try {
      const { default: writeExcelFile } = await import(
        "write-excel-file/browser"
      );
      await writeExcelFile(
        getInventoryReportData(report),
        {
          sheet: "Инвентаризация",
          columns: inventoryReportColumns,
          stickyRowsCount: 12,
          showGridLines: false,
          orientation: "landscape",
        },
        { fontFamily: "Calibri", fontSize: 12 },
      ).toFile(`Инвентаризация_${report.date}.xlsx`);
    } catch {
      showError("Не удалось скачать отчёт. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      size="lg"
      loading={loading}
      leftSection={<IconDownload size={20} />}
      onClick={download}
    >
      Скачать XLSX отчёт
    </Button>
  );
}
