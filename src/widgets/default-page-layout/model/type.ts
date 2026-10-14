import { ReactNode } from "react";
import type { TopSectionProps } from "../ui/components/TopSection/type";

export interface IStatisticCardData {
  title: string;
  value?: string | number;
  valueFontSize?: number;
  description?: string;
  icon: ReactNode;
  color: string;
}

type DefaultPageLayoutBaseProps<T extends string> = {
  title: string;
  subtitle: string;

  children?: ReactNode;
  headerTopSection?: ReactNode;
  headerRightSection?: ReactNode;
  beforeStatistics?: ReactNode;
  topSection?: TopSectionProps<T>;
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

export type IDefaultPageLayoutProps<T extends string = string> =
  DefaultPageLayoutBaseProps<T> & SearchProps & StatisticsProps;
