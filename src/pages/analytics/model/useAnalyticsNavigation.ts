import { useLocation, useNavigate } from "react-router-dom";
import { IconChartBar, IconTopologyStar3 } from "@tabler/icons-react";
import type { TopSectionItem } from "@/widgets/default-page-layout";

const pages: readonly (TopSectionItem & {
  subtitle: string;
  statistic: boolean;
})[] = [
  {
    value: "/analytics/dashboard",
    label: "Дашборд",
    subtitle: "Основная статистика вашего ресторана",
    icon: IconChartBar,
    statistic: true,
  },

  {
    value: "/analytics/dependencies",
    label: "Граф связей",
    subtitle: "Подробные связи продуктов и блюд",
    icon: IconTopologyStar3,
    statistic: false,
  },
];

export function useAnalyticsNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activePage = pages.find((page) => page.value === pathname) ?? pages[0];
  return {
    title: activePage.label,
    subtitle: activePage.subtitle,
    items: pages,
    value: pathname,
    onChange: navigate,
    ariaLabel: "Страницы аналитики",
    statistic: activePage.statistic,
  };
}
