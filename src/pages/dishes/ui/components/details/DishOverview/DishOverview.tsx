import componentClasses from "./DishOverview.module.css";
import {
  Box,
  Center,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconSoupFilled } from "@tabler/icons-react";
import {
  type Dish,
  dishCost,
  dishMarkup,
  dishProfit,
  formatMoney,
  DishStatus,
} from "@/entities/dish";

export function DishOverview({ dish }: { dish: Dish }) {
  const markup = dishMarkup(dish);
  return (
    <Paper withBorder p="lg" className={componentClasses.overview}>
      {dish.imageUrl ? (
        <Image
          src={dish.imageUrl}
          alt={dish.name}
          className={componentClasses.photo}
          fallbackSrc="https://placehold.co/750x400?text=Тут могла быть ваша реклама"
          radius="md"
        />
      ) : (
        <Center className={componentClasses.photo} bg="#DDDDDD" bdrs="md">
          <IconSoupFilled color="gray" size={48} />
        </Center>
      )}
      <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
        <Box>
          <Title order={1} className={componentClasses.title}>
            {dish.name}
          </Title>
          <Text size="sm" c="dimmed" mt={6}>
            {dish.description}
          </Text>
          <Text size="sm" c="dimmed">Категория: {dish.category || "—"}</Text>
        </Box>
        <DishStatus dish={dish} />
        <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="md">
          <Box>
            <Text size="xs" c="dimmed">
              Цена продажи
            </Text>
            <Text fw={700}>{formatMoney(dish.price)}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">
              Себестоимость порции
            </Text>
            <Text fw={700}>{formatMoney(dishCost(dish))}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">
              Наценка
            </Text>
            <Text fw={700} c="primary">
              {markup === null ? "—" : `${markup.toFixed(1)}%`}
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">
              Прибыль с порции
            </Text>
            <Text fw={700} c={(dishProfit(dish) ?? 0) >= 0 ? "green" : "red"}>
              {formatMoney(dishProfit(dish))}
            </Text>
          </Box>
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
