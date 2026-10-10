import type { TablerIcon } from "@tabler/icons-react";
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
