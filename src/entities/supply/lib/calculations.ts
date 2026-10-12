import type { Supply, SupplyItemDraft } from "../model/type.ts";

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

export function getMonthStatistics(supplies: Supply[], month: string) {
  const monthly = supplies.filter((supply) =>
    supply.receivedAt.startsWith(month),
  );
  const total = roundMoney(
    monthly.reduce((sum, supply) => sum + supplyTotal(supply), 0),
  );
  return {
    count: monthly.length,
    total,
    products: monthly.reduce((sum, supply) => sum + supply.items.length, 0),
    average: monthly.length ? roundMoney(total / monthly.length) : 0,
  };
}

export const supplyTotal = (supply: Supply) =>
  roundMoney(supply.items.reduce((sum, item) => sum + item.total, 0));

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
  else if (receivedAt && item.expiresAt <= receivedAt)
    errors.expiresAt = "Срок годности должен быть позже поступления";
  if (
    item.price === "" ||
    !Number.isFinite(Number(item.price)) ||
    Number(item.price) < 0
  )
    errors.price = "Укажите цену от 0 ₽";
  return errors;
}
