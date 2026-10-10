import { Group, Stack } from "@mantine/core";
import TitleSection from "./components/TitleSection";
import { IDefaultPageLayoutProps } from "./model/type";
import SearchSection from "./components/SearchSection/SearchSection";
import StatisticSection from "./components/StatisticSection/StatisticSection";

export default function DefaultPageLayout({
  title,
  subtitle,
  searchTitle,
  searchValue,
  setSearchValue,
  statisticData,
  children,
}: IDefaultPageLayoutProps) {
  return (
    <Stack px="lg" py="xl" h="100svh">
      <Group justify="space-between" align="center" gap="lg">
        <TitleSection title={title} subtitle={subtitle} />
        <SearchSection
          searchTitle={searchTitle}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Group>
      <StatisticSection statisticData={statisticData} />

      {children}
    </Stack>
  );
}
