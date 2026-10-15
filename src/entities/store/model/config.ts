import type { IStoreStatus } from "./type.ts";

export const soonExpiredDays = 7;

export const storeStatuses: Record<IStoreStatus, { label: string; color: string }> = {
  ACTIVE: { label: "В норме", color: "green" },
  DEPLETED: { label: "Закончился", color: "gray" },
  RUNNINGOUT: { label: "Заканчивается", color: "orange" },
};
