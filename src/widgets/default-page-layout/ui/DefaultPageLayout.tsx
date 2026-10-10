import { Box, Group, Stack } from "@mantine/core";
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
    <Stack px="lg" py="xl" h="100%" style={{ minHeight: 0 }}>
      <Group justify="space-between" align="center" gap="lg" style={{ flexShrink: 0 }}>
        <TitleSection title={title} subtitle={subtitle} />
        <SearchSection
          searchTitle={searchTitle}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Group>
      <Box style={{ flexShrink: 0 }}><StatisticSection statisticData={statisticData} /></Box>

      {children}
    </Stack>
  );
}
