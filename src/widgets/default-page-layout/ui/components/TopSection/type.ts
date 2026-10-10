import type { ReactNode } from "react";
import type { TablerIcon } from "@tabler/icons-react";

export type TopSectionItem<T extends string = string> = {
  value: T;
  label: string;
  icon?: TablerIcon;
  disabled?: boolean;
};

export type TopSectionProps<T extends string = string> = {
  items: readonly TopSectionItem<T>[];
  value: T;
  onChange: (value: T) => void;
  rightSection?: ReactNode;
  ariaLabel?: string;
};
