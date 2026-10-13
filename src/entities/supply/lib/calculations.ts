import dayjs from "dayjs";
import type { ISupply, SupplyItemDraft } from "../model/type.ts";

const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateItemPrices(
  item: Pick<SupplyItemDraft, "quantity" | "price" | "pricingMode">,
) {
  const quantity = Number(item.quantity) || 0;
  const price = Number(item.price) || 0;
  return item.pricingMode === "total"
    ? {
        unitPrice: quantity > 0 ? price / quantity : 0,
        total: roundMoney(price),
      }
    : { unitPrice: price, total: roundMoney(quantity * price) };
}

export function getMonthStatistics(supplies: ISupply[], month: string) {
  const monthly = supplies.filter((supply) =>
    dayjs(supply.receivedAt).format("YYYY-MM") === month,
  );
  const total = roundMoney(
    monthly.reduce((sum, supply) => sum + (supplyTotal(supply) ?? 0), 0),
  );
  return {
    count: monthly.length,
    total,
    products: monthly.reduce((sum, supply) => sum + (supply.items?.length ?? 0), 0),
    average: monthly.length ? roundMoney(total / monthly.length) : 0,
  };
}

export const supplyTotal = (supply: ISupply) => supply.totalPrice ?? null;

export function validateItem(
  item: Omit<SupplyItemDraft, "id" | "product">,
  receivedAt: string | null,
) {
  const errors: Partial<
    Record<"quantity" | "unitId" | "expiresAt" | "price", string>
  > = {};
  if (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0)
    errors.quantity = "Укажите количество больше нуля";
  if (!Number.isInteger(item.unitId) || Number(item.unitId) <= 0) errors.unitId = "Выберите единицу измерения";
  if (!item.expiresAt) errors.expiresAt = "Укажите срок годности";
  else if (!Number.isFinite(new Date(item.expiresAt.replace(" ", "T")).getTime()))
    errors.expiresAt = "Укажите корректный срок годности";
  else if (receivedAt && new Date(item.expiresAt.replace(" ", "T")) <= new Date(receivedAt.replace(" ", "T")))
    errors.expiresAt = "Срок годности должен быть позже поступления";
  if (
    item.price === "" ||
    !Number.isFinite(Number(item.price)) ||
    Number(item.price) < 0
  )
    errors.price = "Укажите цену от 0 ₽";
  return errors;
}
