import type { StatisticProduct } from "@/entities/statistic";

export type LowStockProduct = {
  product: StatisticProduct;
  imageUrl?: string;
  quantity: number;
};
