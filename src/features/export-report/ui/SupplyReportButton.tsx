import { downloadSupplyReport, type ISupply } from "@/entities/supply";
import { DownloadButton } from "@/shared/ui/download-button";
export function SupplyReportButton({ supply }: { supply: ISupply }) {
  return (
    <DownloadButton
      variant="default"
      onDownload={() => downloadSupplyReport(supply)}
    >
      Скачать XLSX
    </DownloadButton>
  );
}
