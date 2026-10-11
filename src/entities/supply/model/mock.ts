import dayjs from "dayjs";
import type { Supply } from "./type.ts";
import { mockProducts } from "../../product/@x/supply.ts";
const suppliers = [
  "ООО «АгроФуд»",
  "Мясной двор",
  "Молочный мир",
  "ГрандСервис",
  "Фермерский рынок",
  "Море продуктов",
  "Восток Трейд",
  "Пекарь+",
];
const employees = [
  "Артём Козлов",
  "Мария Волкова",
  "Иван Крылов",
  "Елена Кузнецова",
];

export function createMockSupplies(): Supply[] {
  const today = dayjs();
  return suppliers.map((supplier, index) => {
    const receivedAt = today
      .subtract(index, "day")
      .hour(8 + (index % 4))
      .minute(index * 5)
      .second(0);
    return {
      id: `П-${today.year()}-${String(48 - index).padStart(4, "0")}`,
      supplier,
      receivedAt: receivedAt.format("YYYY-MM-DD HH:mm:ss"),
      acceptedBy: employees[index % employees.length],
      items: Array.from({ length: 3 + (index % 4) }, (_, productIndex) => {
        const product =
          mockProducts[(index * 2 + productIndex) % mockProducts.length];
        const quantity = 5 + productIndex * 3;
        return {
          id: `mock-${index}-${productIndex}`,
          product,
          quantity,
          unit: product.unit,
          expiresAt: receivedAt
            .add(14 + productIndex * 5, "day")
            .format("YYYY-MM-DD HH:mm:ss"),
          unitPrice: product.price,
          total: quantity * product.price,
        };
      }),
    };
  });
}

export const mockSupplies = createMockSupplies();
