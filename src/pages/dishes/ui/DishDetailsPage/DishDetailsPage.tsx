import componentClasses from "./DishDetailsPage.module.css";
import {
  Alert,
  Button,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { useDish, useDishes } from "@/entities/dish";
import { DishOverview } from "../components/details/DishOverview/DishOverview";
import { DishIngredients } from "../components/details/DishIngredients";
import { DishStock } from "../components/details/DishStock";
import { DishDetailsStatistics } from "../components/details/DishDetailsStatistics";
import { DishFormModal } from "@/features/dish-form";
import { DishIngredientSearch } from "../components/DishIngredientSearch";

export function DishDetailsPage() {
  const { dishId } = useParams();
  const { dishes } = useDishes();
  const { dish, isLoading, isError, refetch } = useDish(dishId);
  const [editing, setEditing] = useState(false);

  if (isLoading)
    return (
      <Center w="100%" h="100%">
        <Loader />
      </Center>
    );
  if (isError)
    return (
      <Alert m="lg" color="red" role="alert">
        Не удалось загрузить блюдо.
        <Button type="button" variant="subtle" onClick={() => refetch()}>
          Повторить
        </Button>
      </Alert>
    );

  if (!dish)
    return (
      <Stack p="lg">
        <PageBreadcrumbs
          parentLabel="Блюда"
          parentPath="/dishes"
          currentLabel="Блюдо не найдено"
        />
        <Text>Блюдо не найдено</Text>
      </Stack>
    );

  return (
    <Stack className={componentClasses.page} gap="md">
      <Group justify="space-between">
        <PageBreadcrumbs
          parentLabel="Блюда"
          parentPath="/dishes"
          currentLabel={dish.name}
        />
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconEdit size={16} />}
            onClick={() => setEditing(true)}
          >
            Редактировать
          </Button>
        </Group>
      </Group>
      <DishOverview dish={dish} />

      <DishDetailsStatistics dish={dish} dishes={dishes} />
      {/* <DishFinancialSummary dish={dish} /> */}
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <DishIngredients dish={dish} />

        <DishStock dish={dish} />
      </SimpleGrid>
      <DishFormModal
        opened={editing}
        onClose={() => setEditing(false)}
        dish={dish}
        renderIngredientSearch={(props) => <DishIngredientSearch {...props} />}
      />
    </Stack>
  );
}
