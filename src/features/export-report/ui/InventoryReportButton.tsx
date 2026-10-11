import {
  downloadInventoryReport,
  type InventoryReport,
} from "@/entities/inventory";
import { DownloadButton } from "@/shared/ui/download-button";
export function InventoryReportButton({ report }: { report: InventoryReport }) {
  return (
    <DownloadButton onDownload={() => downloadInventoryReport(report)}>
      Скачать XLSX отчёт
    </DownloadButton>
  );
}
