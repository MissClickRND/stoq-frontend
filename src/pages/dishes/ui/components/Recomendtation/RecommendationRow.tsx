import { Table, Text } from "@mantine/core";
import type { Dish } from "../../../model/type";
import {
  dishMarkup,
  dishProfit,
  formatMoney,
} from "../../../model/calculations";
import { DishIdentity } from "../common/DishIdentity";
import { DishStatus } from "../common/DishStatus";
import { DishDetailsButton } from "../common/DishDetailsButton";
import { RecommendationPriority } from "./RecommendationPriority";

export function RecommendationRow({ dish }: { dish: Dish }) {
  const markup = dishMarkup(dish);
  return (
    <Table.Tr>
      <Table.Td>
        <DishIdentity dish={dish} />
      </Table.Td>
      <Table.Td>
        <Text size="md" fw={700}>
          {formatMoney(dish.price)}
        </Text>
        <Text size="sm" c="dimmed">
          Выручка за неделю:{" "}
          {formatMoney(
            dish.sales.reduce((sum, sale) => sum + sale.quantity, 0) *
              dish.price,
          )}
        </Text>
        <Text size="sm" fw={600} c={dishProfit(dish) >= 0 ? "green" : "red"}>
          Прибыль с порции: {formatMoney(dishProfit(dish))}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text
          size="md"
          fw={700}
          c={markup !== null && markup >= 0 ? "green" : "red"}
        >
          {markup === null ? "—" : `${markup.toFixed(1)}%`}
        </Text>
      </Table.Td>
      <Table.Td>
        <DishStatus dish={dish} />
      </Table.Td>
      <Table.Td>
        <Text size="md" fw={500} maw={280}>
          {dish.recommendation?.reason}
        </Text>
      </Table.Td>
      <Table.Td>
        {dish.recommendation && (
          <RecommendationPriority priority={dish.recommendation.priority} />
        )}
      </Table.Td>
      <Table.Td>
        <DishDetailsButton id={dish.id} />
      </Table.Td>
    </Table.Tr>
  );
}
