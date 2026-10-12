import {
  Button,
  Group,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { formRootRule, useForm } from "@mantine/form";
import type { ReactNode } from "react";
import { dishFormDefaults } from "../model/defaults";
import {
  useIngredients,
  useDishes,
  type Dish,
  type DishDraft,
  type DishIngredient,
} from "@/entities/dish";
import { IngredientQuantityFields } from "./IngredientQuantityFields";

export type IngredientSearchProps = {
  items: DishIngredient[];
  onSelect: (ingredient: DishIngredient) => void;
  error?: ReactNode;
};

export function DishForm({
  dish,
  onClose,
  renderIngredientSearch,
}: {
  dish?: Dish;
  onClose: () => void;
  renderIngredientSearch: (props: IngredientSearchProps) => ReactNode;
}) {
  const { ingredients: ingredientCatalog } = useIngredients();
  const { saveDish } = useDishes();
  const form = useForm<DishDraft>({
    mode: "controlled",
    initialValues: dish
      ? {
          name: dish.name,
          description: dish.description,
          price: dish.price,
          imageUrl: dish.imageUrl ?? "",
          stopped: dish.stopped,
          archived: dish.archived,
          stopReason: dish.stopReason ?? "",
          ingredients: dish.ingredients.map((item) => ({ ...item })),
        }
      : { ...dishFormDefaults, ingredients: [] },
    validateInputOnBlur: true,
    validate: {
      name: (value) => (value.trim() ? null : "Укажите название блюда"),
      description: (value) => (value.trim() ? null : "Укажите описание блюда"),
      price: (value) =>
        Number.isFinite(value) && value > 0
          ? null
          : "Укажите положительную цену",
      imageUrl: (value) =>
        !value || /^(https?:\/\/|\/)/.test(value.trim())
          ? null
          : "Укажите адрес с http://, https:// или путь из public",
      ingredients: {
        [formRootRule]: (value) =>
          value.length ? null : "Добавьте хотя бы один ингредиент",
        quantity: (value) =>
          Number.isFinite(value) && value > 0
            ? null
            : "Укажите положительное количество",
      },
    },
  });
  const availableIngredients = ingredientCatalog.filter(
    (item) =>
      !form.values.ingredients.some((selected) => selected.id === item.id),
  );
  const addIngredient = (ingredient: DishIngredient) => {
    form.insertListItem("ingredients", { ...ingredient });
    form.clearFieldError("ingredients");
  };
  const submit = form.onSubmit((values) => {
    saveDish(
      {
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
        imageUrl: values.imageUrl?.trim(),
      },
      dish?.id,
    );
    //! Закрыть форму и обновить блюдо только после ответа сервера.
  });

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        <TextInput
          label="Ссылка на фото"
          size="lg"
          placeholder="Введите ссылку на фотографию блюда"
          {...form.getInputProps("imageUrl")}
        />
        <TextInput
          label="Название"
          size="lg"
          placeholder="Введите название блюда"
          required
          {...form.getInputProps("name")}
        />
        <Textarea
          label="Описание"
          size="lg"
          placeholder="Введите краткое описание"
          required
          {...form.getInputProps("description")}
        />
        <NumberInput
          label="Цена продажи, ₽"
          required
          size="lg"
          min={0.01}
          decimalScale={2}
          {...form.getInputProps("price")}
        />
        {renderIngredientSearch({
          items: availableIngredients,
          onSelect: addIngredient,
          error: form.errors.ingredients,
        })}
        <IngredientQuantityFields
          ingredients={form.values.ingredients}
          getQuantityInputProps={(index) =>
            form.getInputProps(`ingredients.${index}.quantity`)
          }
          onRemove={(index) => form.removeListItem("ingredients", index)}
        />
        <Group justify="flex-end">
          <Button type="button" size="lg" variant="default" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" size="lg">
            {dish ? "Сохранить изменения" : "Добавить блюдо"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
