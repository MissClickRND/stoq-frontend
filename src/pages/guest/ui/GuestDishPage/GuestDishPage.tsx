import componentClasses from "./GuestDishPage.module.css";
import {
  Alert,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { useDish, dishIsStopped, DishPhoto } from "@/entities/dish";

import { formatOrderMoney } from "@/entities/order";
import { useGuestOrder } from "@/features/guest-order";

import classes from "../../classes/Guest.module.css";

export function GuestDishPage() {
  const { dishId } = useParams();
  const { dish, isLoading, isError, refetch } = useDish(dishId);
  const { basePath, items, addDish } = useGuestOrder();
  if (isLoading)
    return (
      <Center w="100%" mih="50svh">
        <Loader />
      </Center>
    );
  if (isError)
    return (
      <Alert color="red" role="alert">
        Не удалось загрузить блюдо.
        <Button type="button" variant="subtle" onClick={() => refetch()}>
          Повторить
        </Button>
      </Alert>
    );
  if (!dish)
    return (
      <Stack>
        <PageBreadcrumbs
          parentLabel="Меню"
          parentPath={basePath}
          currentLabel="Блюдо не найдено"
        />
        <Paper withBorder p="xl">
          <Title order={1} className={classes.title}>
            Блюдо не найдено
          </Title>
        </Paper>
      </Stack>
    );
  const unavailable = dishIsStopped(dish);
  const quantity = items.find((item) => item.dishId === dish.id)?.quantity;
  return (
    <Stack gap="lg">
      <PageBreadcrumbs
        parentLabel="Меню"
        parentPath={basePath}
        currentLabel={dish.name}
      />
      <div className={componentClasses.detailGrid}>
        <DishPhoto
          src={dish.imageUrl}
          name={dish.name}
          className={componentClasses.detailPhoto}
        />
        <Paper withBorder p="xl">
          <Stack gap="lg">
            <Title order={1} className={classes.title}>
              {dish.name}
            </Title>
            <Text size="lg" c="dimmed">
              {dish.description}
            </Text>
            <div>
              <Text size="lg" fw={600} mb="xs">
                Состав
              </Text>
              <Text>
                {dish.ingredients
                  .map((ingredient) => ingredient.name)
                  .join(", ") || "Состав уточняется"}
              </Text>
            </div>
            <Group justify="space-between">
              <Text size="xl" fw={700}>
                {formatOrderMoney(dish.price)}
              </Text>
              {quantity && (
                <Badge size="lg" variant="light" tt="none">
                  В корзине: {quantity}
                </Badge>
              )}
            </Group>
            {unavailable && (
              <Text c="dimmed">Блюдо временно недоступно для заказа.</Text>
            )}
            <Button
              size="lg"
              disabled={unavailable}
              leftSection={<IconShoppingCart size={20} />}
              onClick={() => addDish(dish)}
            >
              {quantity ? "Добавить ещё" : "Добавить в корзину"}
            </Button>
          </Stack>
        </Paper>
      </div>
    </Stack>
  );
}
