import { useLocation, useNavigate } from "react-router-dom";
import { IconChartBar, IconTopologyStar3 } from "@tabler/icons-react";
import type { TopSectionItem } from "@/widgets/default-page-layout";

const pages: readonly (TopSectionItem & { subtitle: string })[] = [
  {
    value: "/analytics/dashboard",
    label: "Дашборд",
    subtitle: "Основная статистика вашего ресторана",
    icon: IconChartBar,
  },
  // {
  //   value: "/analytics/ingredients",
  //   label: "Анализ ингредиентов",
  //   subtitle: "Расход, остатки и потребность в ингредиентах",
  //   icon: IconLeaf,
  // },
  {
    value: "/analytics/dependencies",
    label: "Граф связей",
    subtitle: "Подробные связи продуктов и блюд",
    icon: IconTopologyStar3,
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
  };
}
