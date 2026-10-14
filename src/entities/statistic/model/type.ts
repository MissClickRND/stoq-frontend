export type IDishStatisticResponse = {
  total: number;
  active: number;
  lowStock: number;
  stopList: number;
};

export type IOrderStatisticResponse = {
  total: number;
  completed: number;
  cancelled: number;
  active: number;
  revenue: string;
};
