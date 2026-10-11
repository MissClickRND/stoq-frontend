import componentClasses from "./NavbarNavigation.module.css";
import { Group, SegmentedControl, Text } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";

import { navigationItems } from "../../model/config";

export function NavbarNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath =
    navigationItems.find(
      (item) =>
        item.path === location.pathname ||
        location.pathname.startsWith(`${item.path}/`),
    )?.path ?? navigationItems[0].path;

  return (
    <SegmentedControl<string>
      aria-label="Основная навигация"
      classNames={{
        root: componentClasses.navigation,
        indicator: componentClasses.indicator,
        label: componentClasses.navigationLabel,
      }}
      fullWidth
      orientation="vertical"
      value={activePath}
      withItemsBorders={false}
      onChange={navigate}
      data={navigationItems.map((item) => ({
        value: item.path,
        label: (
          <Group gap="sm" wrap="nowrap">
            <item.icon size={21} stroke={1.8} aria-hidden />
            <Text size="sm" fw={600}>
              {item.label}
            </Text>
          </Group>
        ),
      }))}
    />
  );
}
