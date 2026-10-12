import { createElement } from "react";
import {
  IconAlertTriangle,
  IconPackage,
  IconClock,
  IconX,
} from "@tabler/icons-react";

export const storeStatisticData = [
  {
    title: "Всего продуктов",
    description: "На складе",
    icon: createElement(IconPackage),
    color: "#0d5e24",
  },
  {
    title: "Закончились",
    description: "Требуется пополнение",
    icon: createElement(IconAlertTriangle),
    color: "#bcbf0d",
  },
  {
    title: "Скоро испортятся",
    description: "Скоро истекут сроки годности",
    icon: createElement(IconClock),
    color: "#a15d10",
  },
  {
    title: "Испорченные",
    description: "Требуется утилизация",
    icon: createElement(IconX),
    color: "#730a17",
  },
];
