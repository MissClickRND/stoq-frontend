import { ReactNode } from "react";

export interface IStatisticCardData {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  color: string;
}

export interface IDefaultPageLayoutProps {
  title: string;
  subtitle: string;

  searchTitle: string;
  searchValue: string;
  setSearchValue: (value: string) => void;

  statisticData: IStatisticCardData[];

  children?: ReactNode;
}
