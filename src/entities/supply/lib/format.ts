import dayjs from "dayjs";

import { formatCurrency } from "../../../shared/lib/format.ts";
export const formatMoney = (value: number | null) => value == null ? "—" : formatCurrency(value);
export const formatDateTime = (value: string) =>
  dayjs(value).format("DD.MM.YYYY · HH:mm");
