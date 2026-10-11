import { createElement } from "react";
import {
  IconCalendarTime,
  IconCoins,
  IconFileInvoice,
  IconPackage,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import type { IStatisticCardData } from "@/widgets/default-page-layout/ui/model/type";
import { supplyTotal } from "./calculations";
import { formatMoney } from "./format";
import type { Supply } from "./type";

export function getSupplyStatistics(supply: Supply): IStatisticCardData[] {
  return [
    {
      title: "ID поставки",
      value: supply.id,
      valueFontSize: 22,
      description: "Номер поступления",
      icon: createElement(IconFileInvoice),
      color: "#526877",
    },
    {
      title: "Дата поступления",
      value: dayjs(supply.receivedAt).format("DD.MM.YYYY"),
      valueFontSize: 24,
      description: `Время: ${dayjs(supply.receivedAt).format("HH:mm")}`,
      icon: createElement(IconCalendarTime),
      color: "#0b7c86",
    },
    {
      title: "Позиций",
      value: supply.items.length,
      description: "Продуктов в поставке",
      icon: createElement(IconPackage),
      color: "#0d5e24",
    },
    {
      title: "Сумма",
      value: formatMoney(supplyTotal(supply)),
      valueFontSize: 24,
      description: "Стоимость всех продуктов",
      icon: createElement(IconCoins),
      color: "#a15d10",
    },
  ];
}
