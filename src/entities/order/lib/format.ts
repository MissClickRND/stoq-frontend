import { formatCurrency } from "../../../shared/lib/format.ts";
export const formatOrderMoney = (value: number | null) => value == null ? "—" : formatCurrency(value);
