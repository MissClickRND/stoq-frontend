import { downloadSupplyReport, type Supply } from "@/entities/supply";
import { DownloadButton } from "@/shared/ui/download-button";
export function SupplyReportButton({ supply }: { supply: Supply }) {
  return (
    <DownloadButton
      variant="default"
      onDownload={() => downloadSupplyReport(supply)}
    >
      Скачать XLSX
    </DownloadButton>
  );
}
