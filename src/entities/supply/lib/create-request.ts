import type { ICreateSupplyRequest, SupplyItemDraft } from "../model/type.ts";
import { validateItem } from "./calculations.ts";

export function toCreateSupplyRequest(draft: {
  supplyNumber: string;
  receivedAt: string | null;
  items: SupplyItemDraft[];
}): ICreateSupplyRequest {
  const supplyNumber = draft.supplyNumber.trim();
  if (!supplyNumber) throw new Error("Укажите номер поставки");
  if (!draft.receivedAt) throw new Error("Укажите дату поступления");
  const receivedAt = new Date(draft.receivedAt.replace(" ", "T"));
  if (!Number.isFinite(receivedAt.getTime())) throw new Error("Укажите корректную дату поступления");
  if (!draft.items.length) throw new Error("Добавьте хотя бы один продукт в поставку");
  return {
    supplyNumber,
    receivedAt: receivedAt.toISOString(),
    items: draft.items.map((item) => {
      const error = Object.values(validateItem(item, draft.receivedAt))[0];
      if (error) throw new Error(error);
      if (!Number.isSafeInteger(item.product.id) || item.product.id <= 0)
        throw new Error("Выберите продукт из каталога");
      if (item.unitId !== item.product.unitId)
        throw new Error("Используйте единицу измерения выбранного продукта");
      return {
        productId: item.product.id,
        quantity: Number(item.quantity),
        expiresAt: new Date(item.expiresAt!.replace(" ", "T")),
      };
    }),
  };
}
