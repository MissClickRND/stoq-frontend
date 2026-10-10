import {
  Box,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconChefHat } from "@tabler/icons-react";
import type { Dish } from "../../../model/type";
import {
  dishCost,
  dishMarkup,
  dishProfit,
  formatMoney,
} from "../../../model/calculations";
import { DishStatus } from "../common/DishStatus";
import classes from "./DishDetails.module.css";

export function DishOverview({ dish }: { dish: Dish }) {
  const markup = dishMarkup(dish);
  return (
    <Paper withBorder p="lg" className={classes.overview}>
      {dish.imageUrl ? (
        <Image
          src={dish.imageUrl}
          alt={dish.name}
          className={classes.photo}
          radius="md"
        />
      ) : (
        <Box className={classes.photoPlaceholder}>
          <ThemeIcon variant="light" size={100} color="primary" radius="xl">
            <IconChefHat size={52} />
          </ThemeIcon>
        </Box>
      )}
      <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
        <Box>
          <Title order={1} className={classes.title}>
            {dish.name}
          </Title>
          <Text size="sm" c="dimmed" mt={6}>
            {dish.description}
          </Text>
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
            <Text fw={700} c={dishProfit(dish) >= 0 ? "green" : "red"}>
              {formatMoney(dishProfit(dish))}
            </Text>
          </Box>
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
