import type { TablerIcon } from "@tabler/icons-react";
import type { MantineColorScheme } from "@mantine/core";
export type NavbarUser = {
  initials: string;
  name: string;
  role: string;
};

export type NavigationItem = {
  label: string;
  path: string;
  icon: TablerIcon;
};

export type NavbarAction = {
  label: string;
  icon: TablerIcon;
};

export type ColorSchemeOption = {
  label: string;
  value: Extract<MantineColorScheme, "light" | "dark">;
  icon: TablerIcon;
};
