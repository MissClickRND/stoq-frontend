import { skipToken } from "@reduxjs/toolkit/query";
import { useGetDishDetailsStatisticQuery, statisticsQueryOptions } from "@/entities/statistic";
import { selectUser, fullAccessRoles } from "@/entities/user";
import { useAppSelector } from "@/shared/lib";
import { StatisticsFeedback } from "@/shared/ui/statistics-feedback";
import { DishSales } from "../components/details/DishSales/DishSales";
import { DishFinancialSummary } from "../components/details/DishFinancialSummary";
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
import { useDish } from "@/entities/dish";
import { DishOverview } from "../components/details/DishOverview/DishOverview";
import { DishIngredients } from "../components/details/DishIngredients";
import { DishStock } from "../components/details/DishStock";
import { DishDetailsStatistics } from "../components/details/DishDetailsStatistics";
import { DishFormModal } from "@/features/dish-form";
import { DishIngredientSearch } from "../components/DishIngredientSearch";

export function DishDetailsPage() {
  const { dishId } = useParams();
  const user = useAppSelector(selectUser);
  const canViewStatistics = Boolean(user.role && fullAccessRoles.includes(user.role));
  const id = Number(dishId);
  const statisticQuery = useGetDishDetailsStatisticQuery(canViewStatistics && Number.isSafeInteger(id) && id > 0 ? { id, days: 7 } : skipToken, statisticsQueryOptions);
  const statistic = statisticQuery.isError ? undefined : statisticQuery.currentData;
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
      <DishOverview dish={dish} statistic={statistic} canViewFinancials={canViewStatistics} />

      {canViewStatistics && <><StatisticsFeedback query={statisticQuery} /><DishDetailsStatistics statistic={statistic} />{statistic && <><DishSales sales={statistic.sales} /><DishFinancialSummary statistic={statistic} /></>}</>}

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
