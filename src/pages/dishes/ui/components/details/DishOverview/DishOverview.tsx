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



  formatMoney,
  DishStatus,
} from "@/entities/dish";

import type { DishDetailsStatistic } from "@/entities/statistic";
export function DishOverview({ dish, statistic, canViewFinancials }: { dish: Dish; statistic?: DishDetailsStatistic; canViewFinancials: boolean }) {
  const markup = statistic?.markup ?? null;
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
          <Text size="sm" c="dimmed">
            Категория: {dish.category || "—"}
          </Text>
        </Box>
        <DishStatus dish={dish} />
        {canViewFinancials && <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="md">
          <Box>
            <Text size="xs" c="dimmed">
              Цена продажи
            </Text>
            <Text fw={700}>{formatMoney(dish.priceKnown === false ? null : dish.price)}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">
              Себестоимость порции
            </Text>
            <Text fw={700}>{formatMoney(statistic?.costPrice ?? null)}</Text>
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
            <Text fw={700} c={(statistic?.profit ?? 0) >= 0 ? "green" : "red"}>
              {formatMoney(statistic?.profit ?? null)}
            </Text>
          </Box>
        </SimpleGrid>}
      </Stack>
    </Paper>
  );
}
