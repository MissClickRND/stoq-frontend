import { ReactNode } from "react";

export interface IStatisticCardData {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  color: string;
}

type DefaultPageLayoutBaseProps = {
  title: string;
  subtitle: string;

  children?: ReactNode;
  topSection?: ReactNode;
};

type SearchProps =
  | {
      disableSearch?: boolean;
      searchTitle: string;
      searchValue: string;
      setSearchValue: (value: string) => void;
    }
  | {
      disableSearch: true;
      searchTitle?: string;
      searchValue?: string;
      setSearchValue?: (value: string) => void;
    };

type StatisticsProps =
  | { disableStatistics?: boolean; statisticData: IStatisticCardData[] }
  | { disableStatistics: true; statisticData?: IStatisticCardData[] };

export type IDefaultPageLayoutProps = DefaultPageLayoutBaseProps &
  SearchProps &
  StatisticsProps;
