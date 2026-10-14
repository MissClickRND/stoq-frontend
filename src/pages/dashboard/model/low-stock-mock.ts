import type { IProduct } from "@/entities/product";
import type { LowStockProduct } from "./type";

const createdAt = "2026-10-01T00:00:00.000Z";
const kilogram = { id: 1, name: "Килограмм", shortName: "кг", createdAt };
const liter = { id: 2, name: "Литр", shortName: "л", createdAt };

function mockProduct(id: number, name: string, unit = kilogram): IProduct {
  return {
    id,
    name,
    unitId: unit.id,
    unit,
    createdAt,
    updatedAt: createdAt,
    isDeleted: false,
  };
}

export const mockLowStockProducts: LowStockProduct[] = [
  {
    product: mockProduct(123, "Помидоры свежие"),
    imageUrl: "/mock-products/tomatoes.jpg",
    quantity: 5,
    initialQuantity: 10,
  },
  {
    product: mockProduct(789, "Сыр моцарелла"),
    imageUrl: "/mock-products/cheese.jpg",
    quantity: 3,
    initialQuantity: 5,
  },
  {
    product: mockProduct(554, "Молоко 3,2%", liter),
    imageUrl: "/mock-products/milk.jpg",
    quantity: 4,
    initialQuantity: 10,
  },
  { product: mockProduct(218, "Сливки 33%", liter), quantity: 1.5, initialQuantity: 8 },
  { product: mockProduct(342, "Филе куриное"), quantity: 2.4, initialQuantity: 12 },
  { product: mockProduct(615, "Сыр пармезан"), quantity: 0.6, initialQuantity: 3 },
  { product: mockProduct(927, "Кофе в зёрнах"), quantity: 1.1, initialQuantity: 5 },
  { product: mockProduct(436, "Шампиньоны"), quantity: 1.6, initialQuantity: 7 },
  { product: mockProduct(803, "Масло сливочное"), quantity: 0.9, initialQuantity: 4 },
  { product: mockProduct(159, "Мука пшеничная"), quantity: 3.2, initialQuantity: 15 },
];
