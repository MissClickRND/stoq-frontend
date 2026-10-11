import dayjs from "dayjs";

export { formatCurrency as formatMoney } from "../../../shared/lib/format.ts";
export const formatDateTime = (value: string) =>
  dayjs(value).format("DD.MM.YYYY · HH:mm");
