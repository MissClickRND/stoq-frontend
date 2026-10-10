import { Box, Group, ScrollArea, SegmentedControl, Text } from "@mantine/core";
import type { TopSectionProps } from "./type";
import classes from "./TopSection.module.css";

export function TopSection<T extends string>({
  items,
  value,
  onChange,
  rightSection,
  ariaLabel = "Навигация по разделам",
}: TopSectionProps<T>) {
  return (
    <Box className={classes.section}>
      <ScrollArea type="auto" className={classes.navigation}>
        <SegmentedControl<T>
          size="lg"
          color="primary"
          autoContrast
          value={value}
          onChange={onChange}
          aria-label={ariaLabel}
          withItemsBorders={false}
          classNames={{
            root: classes.control,
            indicator: classes.indicator,
            label: classes.label,
          }}
          data={items.map((item) => ({
            value: item.value,
            disabled: item.disabled,
            label: (
              <Group gap={8} wrap="nowrap" justify="center">
                {item.icon && <item.icon size={20} aria-hidden />}
                <Text size="inherit" fw="inherit">
                  {item.label}
                </Text>
              </Group>
            ),
          }))}
        />
      </ScrollArea>
      {rightSection != null && rightSection !== false && (
        <Box className={classes.rightSection}>{rightSection}</Box>
      )}
    </Box>
  );
}
