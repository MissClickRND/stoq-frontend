import { Table, Text } from "@mantine/core";
import {
  type IRecommendedDishes,
  type IDish,
  formatMoney,
  DishIdentity,
} from "@/entities/dish";

import { DishDetailsButton } from "../common/DishDetailsButton";
export function RecommendationRow({ dish, catalogDish }: { dish: IRecommendedDishes; catalogDish?: IDish }) {
  const markup =
    dish.costPrice !== null && dish.costPrice > 0
      ? ((dish.salePrice - dish.costPrice) / dish.costPrice) * 100
      : null;
  return (
    <Table.Tr>
      <Table.Td>
        <DishIdentity dish={{ name: dish.dishName, imageURL: dish.imageURL || catalogDish?.imageURL, imageUrl: dish.imageUrl || catalogDish?.imageUrl }} />
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {formatMoney(dish.salePrice)}
        </Text>
        <Text size="sm" c="dimmed">
          Себестоимость: {formatMoney(dish.costPrice)}
        </Text>
        <Text
          size="lg"
          fw={600}
          c={
            dish.profit === null ? "dimmed" : dish.profit >= 0 ? "green" : "red"
          }
        >
          Прибыль с порции: {formatMoney(dish.profit)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text
          size="lg"
          fw={700}
          c={markup === null ? "dimmed" : markup >= 0 ? "green" : "red"}
        >
          {markup === null ? "—" : `${markup.toFixed(1)}%`}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {dish.maxPortions}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={500} maw={280}>
          {dish.expiringProducts.length
            ? dish.expiringProducts.join(", ")
            : "Нет продуктов с близким сроком годности"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(
            dish.recommendationScore,
          )}
        </Text>
      </Table.Td>
      <Table.Td>
        <DishDetailsButton id={dish.dishId} />
      </Table.Td>
    </Table.Tr>
  );
}
