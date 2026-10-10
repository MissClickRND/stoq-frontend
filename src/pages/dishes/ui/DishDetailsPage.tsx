import { Alert, Button, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconArrowLeft, IconEdit, IconArchive } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { useDishes } from "../model/DishesProvider";
import { DishOverview } from "./components/details/DishOverview";
import { DishIngredients } from "./components/details/DishIngredients";
import { DishSales } from "./components/details/DishSales";
import { DishStock } from "./components/details/DishStock";
import { DishFinancialSummary } from "./components/details/DishFinancialSummary";
import { DishDetailsStatistics } from "./components/details/DishDetailsStatistics";
import { DishFormModal } from "./components/form/DishFormModal";
import classes from "./components/details/DishDetails.module.css";

export function DishDetailsPage() {
  const { dishId } = useParams();
  const navigate = useNavigate();
  const { dishes, archiveDish } = useDishes();
  const dish = dishes.find((item) => item.id === dishId);
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);

  if (!dish)
    return (
      <Stack p="lg">
        <Text>Блюдо не найдено</Text>
        <Button onClick={() => navigate("/dishes")}>К списку блюд</Button>
      </Stack>
    );

  return (
    <Stack className={classes.page} gap="md">
      <Group justify="space-between">
        <Button
          variant="default"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/dishes")}
        >
          Назад к блюдам
        </Button>
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconEdit size={16} />}
            onClick={() => setEditing(true)}
          >
            Редактировать
          </Button>
          <Button
            variant="light"
            color="red"
            leftSection={<IconArchive size={16} />}
            onClick={() => setArchiving(true)}
            disabled={dish.archived}
          >
            {dish.archived ? "В архиве" : "В архив"}
          </Button>
        </Group>
      </Group>
      <DishOverview dish={dish} />
      {dish.archived && (
        <Alert color="gray" title="Блюдо в архиве">
          Блюдо исключено из текущего меню.
        </Alert>
      )}

      <DishDetailsStatistics dish={dish} dishes={dishes} />
      <DishFinancialSummary dish={dish} />
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <DishIngredients dish={dish} />
        <Stack gap="md">
          <DishSales dish={dish} />
          <DishStock dish={dish} />
        </Stack>
      </SimpleGrid>
      <DishFormModal
        opened={editing}
        onClose={() => setEditing(false)}
        dish={dish}
      />
      <ConfirmationModal
        opened={archiving}
        title="Архивировать блюдо"
        message={`Переместить «${dish.name}» в архив? Блюдо исчезнет из текущего меню.`}
        confirmText="В архив"
        cancelText="Отмена"
        onClose={() => setArchiving(false)}
        onConfirm={() => {
          archiveDish(dish.id);
          navigate("/dishes");
        }}
      />
    </Stack>
  );
}
