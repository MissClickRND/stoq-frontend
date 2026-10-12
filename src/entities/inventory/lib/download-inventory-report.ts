import type { InventoryReport } from "../model/type.ts";
import {
  getInventoryReportData,
  inventoryReportColumns,
} from "./inventory-report.ts";

export async function downloadInventoryReport(
  report: InventoryReport,
): Promise<void> {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
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
}
