import { mockSupplies } from "../model/mock.ts";
import type { Supply } from "../model/type.ts";
export function createSupply(_draft: Omit<Supply, "id">): void {
  //! Подключить создание поставки; принимать ID и данные созданной поставки от сервера.
}
export function useSupplies() {
  //! Подключить запрос списка поставок; фильтрация месяца и пагинация на сервере.
  return { supplies: mockSupplies, addSupply: createSupply };
}
export function useSupply(id: string | undefined) {
  //! Подключить запрос поставки по ID вместе с позициями и принявшим сотрудником.
  return { supply: mockSupplies.find((supply) => supply.id === id) };
}

import { getSupplyReportData, supplyReportColumns } from "../lib/report.ts";
import { supplyTotal } from "../lib/calculations.ts";

export async function downloadSupplyReport(supply: Supply): Promise<void> {
  //! При серверном экспорте подключить запрос XLSX отчёта; сейчас файл строится из прочитанных данных.
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  await writeExcelFile(
    getSupplyReportData(supply, supplyTotal(supply)),
    {
      sheet: "Поставка",
      columns: supplyReportColumns,
      stickyRowsCount: 11,
      showGridLines: false,
      orientation: "landscape",
    },
    { fontFamily: "Calibri", fontSize: 12 },
  ).toFile(`Поставка_${supply.id.replace(/[<>:"/\\|?*]/g, "_")}.xlsx`);
}
