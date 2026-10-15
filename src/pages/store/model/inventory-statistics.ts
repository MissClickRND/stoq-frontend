import { createElement } from "react";
import {
  IconPackage,
  IconRefresh,
  IconTrash,
  IconClock,
  IconCheck,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import {

  type InventoryCounts,
  type InventoryReport,
} from "@/entities/inventory";

export function getInventoryConfirmationStatistics(counts?: InventoryCounts) {

  return [
    {
      title: "Будет обновлено",
      value: counts?.updated ?? "—",
      description: "Изменён фактический остаток",
      icon: createElement(IconRefresh),
      color: "#0d5e24",
    },
    {
      title: "К списанию",
      value: counts?.deleted ?? "—",
      description: "Остатки позиций будут обнулены",
      icon: createElement(IconTrash),
      color: "#730a17",
    },
    {
      title: "Без изменений",
      value: counts?.unchanged ?? "—",
      description: "Остатки совпадают",
      icon: createElement(IconCheck),
      color: "#526877",
    },
    {
      title: "Проверено",
      value: counts?.checked ?? "—",
      description: "Всего позиций",
      icon: createElement(IconPackage),
      color: "#0b7c86",
    },
  ];
}

export function getInventoryReportStatistics(report: InventoryReport) {
  return [
    {
      title: "Проверено",
      value: report.counts.checked,
      description: "Позиций склада",
      icon: createElement(IconPackage),
      color: "#0b7c86",
    },
    {
      title: "Обновлено",
      value: report.counts.updated,
      description: "Остатки скорректированы",
      icon: createElement(IconRefresh),
      color: "#0d5e24",
    },
    {
      title: "Списано",
      value: report.counts.deleted,
      description: "Позиций склада",
      icon: createElement(IconTrash),
      color: "#730a17",
    },
    {
      title: "Завершено",
      value: dayjs(report.completedAt).format("DD.MM.YYYY"),
      valueFontSize: 24,
      description: dayjs(report.completedAt).format("HH:mm"),
      icon: createElement(IconClock),
      color: "#526877",
    },
  ];
}
