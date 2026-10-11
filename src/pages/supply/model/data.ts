import dayjs from "dayjs";
import type { Supply, SupplyProduct } from "./type";

export const supplyProducts: SupplyProduct[] = [
  {
    id: "tomato",
    title: "Помидоры свежие",
    article: "00001",
    unit: "кг",
    price: 220,
  },
  {
    id: "cherry",
    title: "Помидоры черри",
    article: "00002",
    unit: "кг",
    price: 390,
  },
  {
    id: "cucumber",
    title: "Огурцы свежие",
    article: "00003",
    unit: "кг",
    price: 160,
  },
  {
    id: "chicken",
    title: "Куриное филе",
    article: "00004",
    unit: "кг",
    price: 420,
  },
  {
    id: "beef",
    title: "Говядина вырезка",
    article: "00005",
    unit: "кг",
    price: 890,
  },
  { id: "milk", title: "Молоко 3,2%", article: "00006", unit: "л", price: 95 },
  { id: "cream", title: "Сливки 33%", article: "00007", unit: "л", price: 380 },
  {
    id: "eggs",
    title: "Яйцо куриное С0",
    article: "00008",
    unit: "шт.",
    price: 14,
  },
  {
    id: "flour",
    title: "Мука пшеничная",
    article: "00009",
    unit: "кг",
    price: 65,
  },
  {
    id: "oil",
    title: "Масло оливковое",
    article: "00010",
    unit: "л",
    price: 740,
  },
  {
    id: "salmon",
    title: "Лосось охлаждённый",
    article: "00011",
    unit: "кг",
    price: 1490,
  },
  {
    id: "spinach",
    title: "Шпинат свежий",
    article: "00012",
    unit: "кг",
    price: 560,
  },
];

export const initialUnits = ["кг", "г", "л", "мл", "шт.", "уп."];
export const supplyColumns = [
  "ID поставки",
  "Поставщик",
  "Дата поступления",
  "Позиций",
  "Сумма",
  "Принял",
  "Действия",
];
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
          supplyProducts[(index * 2 + productIndex) % supplyProducts.length];
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
