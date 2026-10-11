import type { Key, ReactNode } from "react";

export type TableLayoutProps<T> = {
  columns: readonly string[];
  data: readonly T[];
  renderRow: (item: T) => ReactNode;
  getRowKey: (item: T) => Key;
  emptyText: string;
  minWidth?: number;
  autoHeight?: boolean;
  fillHeight?: boolean;
};
