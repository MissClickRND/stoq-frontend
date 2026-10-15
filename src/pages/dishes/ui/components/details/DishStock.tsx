import {
  Badge,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  type Dish,
  ingredientPortions,
  isIngredientExpired,
} from "@/entities/dish";

export function DishStock({ dish }: { dish: Dish }) {
  return (
    <Paper withBorder p="md">
      <Title order={3} size="h5" mb="md">
        Остатки ингредиентов
      </Title>
      <Stack gap="md">
        {dish.ingredients.map((item) => {
          const portions = ingredientPortions(item);
          const color =
            isIngredientExpired(item) || portions === 0
              ? "red"
              : portions < 5
                ? "orange"
                : "var(--mantine-primary-color-5)";
          return (
            <Stack key={item.id} gap={4}>
              <Group justify="space-between">
                <Text size="sm">{item.name}</Text>
                <Text size="xs" c="dimmed">
                  {item.stock} {item.unit}
                </Text>
              </Group>
              <Progress
                value={Math.min(100, (portions / 20) * 100)}
                color={color}
              />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {item.expiresOn ? "До " : "Нет пригодных партий"}
                  {item.expiresOn &&
                    new Date(`${item.expiresOn}T12:00:00`).toLocaleDateString(
                      "ru-RU",
                    )}
                </Text>
                {isIngredientExpired(item) ? (
                  <Badge size="xs" color="red" variant="light">
                    Просрочен
                  </Badge>
                ) : (
                  <Text size="xs" c="dimmed">
                    На {portions} порций
                  </Text>
                )}
              </Group>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
