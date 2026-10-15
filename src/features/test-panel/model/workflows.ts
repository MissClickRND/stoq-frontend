export type TestRequest = <T>(
  url: string,
  method?: "GET" | "POST" | "PATCH",
  body?: unknown,
) => Promise<T>;
type CatalogProduct = {
  id: number;
  name: string;
  unit?: { id: number; shortName: string };
};
type Unit = { id: number; shortName: string };

const products = [
  {
    name: "Мука пшеничная",
    unit: "кг",
    quantity: 20,
    totalPrice: 1200,
    shelfLifeDays: 180,
  },
  {
    name: "Молоко",
    unit: "л",
    quantity: 12,
    totalPrice: 1200,
    shelfLifeDays: 7,
  },
  {
    name: "Яйцо куриное",
    unit: "шт.",
    quantity: 60,
    totalPrice: 600,
    shelfLifeDays: 21,
  },
  {
    name: "Томаты",
    unit: "кг",
    quantity: 10,
    totalPrice: 1800,
    shelfLifeDays: 3,
  },
  {
    name: "Моцарелла",
    unit: "кг",
    quantity: 5,
    totalPrice: 2000,
    shelfLifeDays: 14,
  },
  {
    name: "Масло растительное",
    unit: "л",
    quantity: 3,
    totalPrice: 900,
    shelfLifeDays: 365,
  },
];

// Photographs selected from Yandex Images; HTTPS thumbnails work in dish cards.
const photos = {
  omelette:
    "https://avatars.mds.yandex.net/i?id=a6cde86e9b49a41cdb59268f15e567e9cb489ecc-4570299-images-thumbs&n=13",
  caprese:
    "https://avatars.mds.yandex.net/i?id=f81bb6c3d87fde44bd21c14d0406378be564b49d-8186099-images-thumbs&n=13",
  pancakes:
    "https://avatars.mds.yandex.net/i?id=10f79e7f726080f23c206a283a27b58d5344b917-4351964-images-thumbs&n=13",
};

export async function seedRestaurant(
  request: TestRequest,
  token: string,
  now = new Date(),
) {
  const units = await request<Unit[]>("/product/units");
  for (const [name, shortName] of [
    ["Килограмм", "кг"],
    ["Литр", "л"],
    ["Штука", "шт."],
  ]) {
    if (!units.some((unit) => unit.shortName === shortName)) {
      units.push(
        await request<Unit>("/product/units", "POST", { name, shortName }),
      );
    }
  }
  const catalog = await request<CatalogProduct[]>("/product?search=");
  const existingDishes = await request<{ name: string }[]>("/dishes?search=");
  for (const product of products) {
    const existing = catalog.find((item) => item.name === product.name);
    const expectedUnit = units.find((unit) => unit.shortName === product.unit)!;
    if (existing?.unit && existing.unit.id !== expectedUnit.id) {
      throw new Error(
        `У продукта «${product.name}» другая единица измерения. Для демо-набора нужна «${product.unit}».`,
      );
    }
  }
  const missingProducts = products.filter(
    (product) => !catalog.some((item) => item.name === product.name),
  );
  const created = missingProducts.length
    ? await request<CatalogProduct[]>(
        "/product/few",
        "POST",
        missingProducts.map((product) => ({
          name: product.name,
          unitId: units.find((unit) => unit.shortName === product.unit)!.id,
        })),
      )
    : [];
  const ids = products.map((product) => {
    const found = [...catalog, ...created].find(
      (item) => item.name === product.name,
    );
    if (!found)
      throw new Error("Каталог вернул неполный список созданных продуктов");
    return found.id;
  });
  const expiresAfter = (milliseconds: number) =>
    new Date(now.getTime() + milliseconds).toISOString();
  const supply = await request<{ id: number }>("/supplies", "POST", {
    supplyNumber: `ТЕСТ-${token}`,
    supplier: "Демо-поставщик",
    status: "RECEIVED",
    receivedAt: now.toISOString(),
    items: [
      ...products.map((product, index) => ({
        productId: ids[index],
        quantity: product.quantity,
        totalPrice: product.totalPrice,
        expiresAt: expiresAfter(product.shelfLifeDays * 86400000),
      })),
      {
        productId: ids[1],
        quantity: 0.5,
        totalPrice: 50,
        expiresAt: expiresAfter(2 * 60000),
      },
      {
        productId: ids[4],
        quantity: 0.3,
        totalPrice: 120,
        expiresAt: expiresAfter(5 * 60000),
      },
    ],
  });
  const demoDishes = [
    {
      name: "Омлет с томатами",
      imageURL: photos.omelette,
      category: "Завтраки",
      description: "Яйца, молоко, томаты",
      salePrice: 320,
      recipeItems: [
        { productId: ids[2], quantity: 2 },
        { productId: ids[1], quantity: 0.1 },
        { productId: ids[3], quantity: 0.15 },
      ],
    },
    {
      name: "Капрезе",
      imageURL: photos.caprese,
      category: "Салаты",
      description: "Томаты и моцарелла",
      salePrice: 450,
      recipeItems: [
        { productId: ids[3], quantity: 0.2 },
        { productId: ids[4], quantity: 0.15 },
        { productId: ids[5], quantity: 0.01 },
      ],
    },
    {
      name: "Блины",
      imageURL: photos.pancakes,
      category: "Завтраки",
      description: "Блины на молоке",
      salePrice: 250,
      recipeItems: [
        { productId: ids[0], quantity: 0.1 },
        { productId: ids[1], quantity: 0.2 },
        { productId: ids[2], quantity: 1 },
      ],
    },
  ];
  const missingDishes = demoDishes.filter(
    (dish) => !existingDishes.some((item) => item.name === dish.name),
  );
  const dishes = missingDishes.length
    ? await request<{ id: number }[]>("/dishes/batch", "POST", missingDishes)
    : [];
  return {
    products: created.length,
    dishes: dishes.length,
    supplyId: supply.id,
  };
}

export async function createShortLifeSupply(
  request: TestRequest,
  token: string,
  now = new Date(),
) {
  const catalog = await request<CatalogProduct[]>("/product?search=");
  if (!catalog.length) throw new Error("Сначала заполните каталог продуктов");
  const preferredNames = ["Молоко", "Моцарелла"];
  const selected = [
    ...catalog.filter((product) => preferredNames.includes(product.name)),
    ...catalog.filter((product) => !preferredNames.includes(product.name)),
  ].slice(0, 2);
  return request<{ id: number }>("/supplies", "POST", {
    supplyNumber: `СКОРО-${token}`,
    supplier: "Демо-поставщик",
    status: "RECEIVED",
    receivedAt: now.toISOString(),
    items: selected.map((product, index) => ({
      productId: product.id,
      quantity: 1,
      totalPrice: 100,
      expiresAt: new Date(
        now.getTime() + (index + 1) * 60000,
      ).toISOString(),
    })),
  });
}

export async function createExternalSupply(
  request: TestRequest,
  token: string,
  now = new Date(),
) {
  const catalog = await request<CatalogProduct[]>("/product?search=");
  if (!catalog.length) throw new Error("Сначала заполните каталог продуктов");
  return request<{ id: number }>("/supplies", "POST", {
    supplyNumber: `ВНЕШ-${token}`,
    supplier: "Внешний поставщик · демо-импорт",
    status: "IN_TRANSIT",
    receivedAt: new Date(now.getTime() + 86400000).toISOString(),
    items: catalog.slice(0, 3).map((product) => ({
      productId: product.id,
      quantity: 2,
      totalPrice: 400,
      expiresAt: new Date(now.getTime() + 15 * 86400000).toISOString(),
    })),
  });
}
