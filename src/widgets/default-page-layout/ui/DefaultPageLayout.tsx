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
  const {
    title,
    subtitle,
    children,
    topSection,
    headerTopSection,
    headerRightSection,
  } = props;
  return (
    <Stack className={classes.page}>
      {headerTopSection && (
        <Box style={{ flexShrink: 0 }}>{headerTopSection}</Box>
      )}
      <Group
        className={
          headerRightSection
            ? `${classes.header} ${classes.headerWithRight}`
            : classes.header
        }
        justify="space-between"
        align="center"
        gap="lg"
      >
        <Box className={headerRightSection ? classes.headerTitle : undefined}>
          <TitleSection title={title} subtitle={subtitle} />
        </Box>
        {headerRightSection && (
          <Box className={classes.headerRight}>{headerRightSection}</Box>
        )}
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
