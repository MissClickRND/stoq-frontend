import { normalizeArticle } from "../../../shared/lib/format.ts";
import type { CellObject, SheetData, Row } from "write-excel-file/browser";
import type { InventoryReport } from "../model/type.ts";

const text = (value: string): CellObject => ({
  value,
  type: String,
  format: "@",
});
const metadata = (label: string, value: CellObject): Row => [
  { ...text(label), fontWeight: "bold", height: 26 },
  { ...value, columnSpan: 6 },
  null,
  null,
  null,
  null,
  null,
];
export const inventoryReportColumns = [
  { width: 40 },
  { width: 22 },
  { width: 18 },
  { width: 18 },
  { width: 18 },
  { width: 18 },
  { width: 26 },
];

export function getInventoryReportData(report: InventoryReport): SheetData {
  return [
    [
      {
        ...text("STOQ · Отчёт инвентаризации"),
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
        ...text("Результаты проверки остатков склада"),
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
    metadata("Дата инвентаризации", {
      value: new Date(`${report.date}T00:00:00Z`),
      type: Date,
      format: "dd.mm.yyyy",
    }),
    metadata("Завершено", {
      value: new Date(`${report.completedAt.replace(" ", "T")}Z`),
      type: Date,
      format: "dd.mm.yyyy hh:mm",
    }),
    metadata("Провёл", text(report.completedBy)),
    metadata("Проверено", {
      value: report.counts.checked,
      type: Number,
      fontWeight: "bold",
    }),
    metadata("Обновлено", {
      value: report.counts.updated,
      type: Number,
      fontWeight: "bold",
    }),
    metadata("Списано", {
      value: report.counts.deleted,
      type: Number,
      fontWeight: "bold",
    }),
    metadata("Без изменений", { value: report.counts.unchanged, type: Number }),
    [],
    [
      "Продукт",
      "ID поставки",
      "Артикул",
      "Было",
      "Стало",
      "Ед. измерения",
      "Результат",
    ].map(
      (label): CellObject => ({
        ...text(label),
        backgroundColor: "#e6f9d2",
        fontWeight: "bold",
        height: 32,
      }),
    ),
    ...report.entries.map(
      (entry): Row => [
        {
          ...text(entry.product.product?.name ?? "Продукт #" + entry.product.productId),
          fontWeight: "bold",
          wrap: true,
          height: 32,
        },
        text(normalizeArticle(entry.product.supplyId)),
        text(normalizeArticle(entry.product.productId)),
        {
          value: entry.product.balance.availableQuantity,
          type: Number,
          format: "#,##0.###",
          fontWeight: "bold",
        },
        {
          value: entry.remove ? 0 : Number(entry.actual),
          type: Number,
          format: "#,##0.###",
          fontWeight: "bold",
        },
        text(entry.product.product?.unit?.shortName ?? "шт."),
        text(
          entry.remove
            ? "Списано"
            : Number(entry.actual) !== entry.product.balance.availableQuantity
              ? "Обновлено"
              : "Без изменений",
        ),
      ],
    ),
  ];
}
