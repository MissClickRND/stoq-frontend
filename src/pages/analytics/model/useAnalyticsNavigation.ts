import { useLocation, useNavigate } from "react-router-dom";
import { IconChartBar, IconLeaf, IconTopologyStar3 } from "@tabler/icons-react";
import type { TopSectionItem } from "@/widgets/default-page-layout";

const pages: readonly TopSectionItem[] = [
  { value: "/analytics/dashboard", label: "Дашборд", icon: IconChartBar },
  {
    value: "/analytics/ingredients",
    label: "Анализ ингредиентов",
    icon: IconLeaf,
  },
  {
    value: "/analytics/dependencies",
    label: "Карта зависимостей",
    icon: IconTopologyStar3,
  },
];

export function useAnalyticsNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return {
    items: pages,
    value: pathname,
    onChange: navigate,
    ariaLabel: "Страницы аналитики",
  };
}
