import type { InventoryEntry, InventoryReport } from "../model/type.ts";
import { mockInventoryReport } from "../model/mock.ts";
export function saveInventory(
  _entries: InventoryEntry[],
  _date: string,
  _name: string,
): void {
  //! Подключить массовое сохранение результатов инвентаризации. Итоги и время завершения получать от сервера.
}
export function useInventoryReport() {
  //! Подключить запрос сохранённого отчёта по ID инвентаризации.
  return { report: mockInventoryReport };
}

import {
  getInventoryReportData,
  inventoryReportColumns,
} from "../lib/inventory-report.ts";

export async function downloadInventoryReport(
  report: InventoryReport,
): Promise<void> {
  //! При серверном экспорте подключить запрос XLSX отчёта; сейчас файл строится из прочитанных данных.
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
