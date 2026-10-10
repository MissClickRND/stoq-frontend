import { Box, Group, Stack } from "@mantine/core";
import TitleSection from "./components/TitleSection";
import type { IDefaultPageLayoutProps } from "./model/type";
import SearchSection from "./components/SearchSection/SearchSection";
import StatisticSection from "./components/StatisticSection/StatisticSection";
import classes from "./DefaultPageLayout.module.css";
import { TopSection } from "./components/TopSection/TopSection";

export default function DefaultPageLayout<T extends string = string>(
  props: IDefaultPageLayoutProps<T>,
) {
  const { title, subtitle, children, topSection } = props;
  return (
    <Stack className={classes.page}>
      <Group
        className={classes.header}
        justify="space-between"
        align="center"
        gap="lg"
      >
        <TitleSection title={title} subtitle={subtitle} />
        {!props.disableSearch && (
          <SearchSection
            searchTitle={props.searchTitle}
            searchValue={props.searchValue}
            setSearchValue={props.setSearchValue}
          />
        )}
      </Group>
      {topSection && <TopSection {...topSection} />}
      {!props.disableStatistics && (
        <Box style={{ flexShrink: 0 }}>
          <StatisticSection statisticData={props.statisticData} />
        </Box>
      )}

      {children}
    </Stack>
  );
}
