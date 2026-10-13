import { supplyProductName, supplyProductReference } from "./product-snapshot.ts";
import type { CellObject, Row, SheetData } from "write-excel-file/browser";
import type { ISupply } from "../model/type.ts";

const currencyFormat = '#,##0.00 "₽"';
const dateFormat = "dd.mm.yyyy hh:mm";
const textCell = (value: string): CellObject => ({
  value,
  type: String,
  format: "@",
});
const moneyCell = (value: number | null): CellObject => value == null ? textCell("—") : ({
  value,
  type: Number,
  format: currencyFormat,
  align: "right",
  fontWeight: "bold",
});

// Excel serial dates store wall-clock time; UTC encoding preserves the selected local hours.
const dateCell = (value: string): CellObject => {
  const local = new Date(value.replace(" ", "T"));
  if (!Number.isFinite(local.getTime())) return textCell("—");
  return {
    value: new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate(),
      local.getHours(), local.getMinutes(), local.getSeconds())),
    type: Date,
    format: dateFormat,
  };
};

const metadataRow = (label: string, cell: CellObject): Row => [
  {
    ...textCell(label),
    textColor: "#526877",
    fontWeight: "bold",
    height: 28,
    wrap: true,
  },
  { ...cell, columnSpan: 6, height: 28 },
  null,
  null,
  null,
  null,
  null,
];

export const supplyReportColumns = [
  { width: 24 },
  { width: 40 },
  { width: 16 },
  { width: 18 },
  { width: 20 },
  { width: 22 },
  { width: 26 },
];

export function getSupplyReportData(supply: ISupply, total: number | null): SheetData {
  const headings = [
    "ID / артикул",
    "Продукт",
    "Количество",
    "Ед. измерения",
    "Цена за ед.",
    "Сумма",
    "Срок годности",
  ];
  return [
    [
      {
        ...textCell(`STOQ · Поставка ${supply.supplyNumber}`),
        columnSpan: 7,
        fontSize: 20,
        fontWeight: "bold",
        backgroundColor: "#002a2d",
        textColor: "#ffffff",
        height: 40,
      },
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    [
      {
        ...textCell("Отчёт о поступлении продуктов"),
        columnSpan: 7,
        textColor: "#526877",
        height: 26,
      },
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    [],
    metadataRow("Номер поставки", textCell(supply.supplyNumber)),
    metadataRow("Поставщик", textCell(supply.supplier || "—")),
    metadataRow("Дата поступления", dateCell(supply.receivedAt)),
    metadataRow("Принял", textCell(supply.acceptedBy || "Пользователь")),
    metadataRow("Позиций", {
      value: (supply.items?.length ?? 0),
      type: Number,
      fontWeight: "bold",
    }),
    metadataRow("Общая сумма", moneyCell(total)),
    [],
    headings.map((label) => ({
      ...textCell(label),
      fontWeight: "bold",
      backgroundColor: "#e6f9d2",
      height: 32,
      wrap: true,
      alignVertical: "center",
    })),
    ...(supply.items ?? []).map(
      (item): Row =>
        (
          [
            textCell(supplyProductReference(item.product)),
            { ...textCell(supplyProductName(item.product)), fontWeight: "bold", wrap: true },
            {
              value: item.quantity,
              type: Number,
              format: "#,##0.###",
              align: "right",
              fontWeight: "bold",
            },
            textCell(item.product?.unit?.shortName ?? "шт."),
            moneyCell(item.price),
            moneyCell(item.totalPrice),
            dateCell(item.expiresAt),
          ] satisfies CellObject[]
        ).map(
          (cell): CellObject => ({
            ...cell,
            height: 34,
            alignVertical: "center",
            bottomBorderStyle: "thin",
            bottomBorderColor: "#dce3e8",
          }),
        ),
    ),
    [
      {
        ...textCell("Итого"),
        columnSpan: 5,
        fontWeight: "bold",
        backgroundColor: "#e6f9d2",
        height: 32,
      },
      null,
      null,
      null,
      null,
      { ...moneyCell(total), backgroundColor: "#e6f9d2" },
      { value: "", backgroundColor: "#e6f9d2" },
    ],
  ];
}
