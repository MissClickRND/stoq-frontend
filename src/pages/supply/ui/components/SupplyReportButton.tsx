import { useState } from "react";
import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useNotifications } from "@/shared/lib/hooks/useNotifications";
import { supplyTotal } from "../../model/calculations";
import { getSupplyReportData, supplyReportColumns } from "../../model/report";
import type { Supply } from "../../model/type";

export function SupplyReportButton({ supply }: { supply: Supply }) {
  const [loading, setLoading] = useState(false);
  const { showError } = useNotifications();
  const download = async () => {
    setLoading(true);
    try {
      const { default: writeExcelFile } = await import(
        "write-excel-file/browser"
      );
      await writeExcelFile(
        getSupplyReportData(supply, supplyTotal(supply)),
        {
          sheet: "Поставка",
          showGridLines: false,
          orientation: "landscape",
          columns: supplyReportColumns,
          stickyRowsCount: 11,
        },
        { fontFamily: "Calibri", fontSize: 12 },
      ).toFile(`Поставка_${supply.id.replace(/[<>:"/\\|?*]/g, "_")}.xlsx`);
    } catch {
      showError("Не удалось скачать отчёт. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      size="lg"
      variant="default"
      leftSection={<IconDownload size={20} />}
      loading={loading}
      onClick={download}
    >
      Скачать XLSX
    </Button>
  );
}
