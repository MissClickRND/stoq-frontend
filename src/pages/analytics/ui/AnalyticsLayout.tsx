import { Outlet } from "react-router-dom";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useAnalyticsNavigation } from "../model/useAnalyticsNavigation";

export function AnalyticsLayout() {
  const { title, subtitle, ...navigation } = useAnalyticsNavigation();

  return (
    <DefaultPageLayout
      title={title}
      subtitle={subtitle}
      disableSearch
      disableStatistics
      topSection={navigation}
    >
      <Outlet />
    </DefaultPageLayout>
  );
}
