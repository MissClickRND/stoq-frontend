import { formatCurrency } from "../../../shared/lib/format.ts";
export const formatPrice = (value: string) =>
  formatCurrency(Number(value), 2, 2);
