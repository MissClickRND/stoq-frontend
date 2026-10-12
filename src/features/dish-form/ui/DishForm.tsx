import {
  Autocomplete,
  Button,
  Group,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { formRootRule, useForm } from "@mantine/form";
import { useState } from "react";
import { dishFormDefaults } from "../model/defaults";
import {
  useIngredients,
  useDishes,
  type Dish,
  type DishDraft,
} from "@/entities/dish";
import { IngredientQuantityFields } from "./IngredientQuantityFields";

export function DishForm({
  dish,
  onClose,
}: {
  dish?: Dish;
  onClose: () => void;
}) {
  const { ingredients: ingredientCatalog } = useIngredients();
  const { saveDish } = useDishes();
  const ingredientCombobox = useCombobox();
  const [ingredientSearch, setIngredientSearch] = useState("");
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
  const addIngredient = (id: string) => {
    const ingredient = availableIngredients.find((item) => item.id === id);
    if (!ingredient) return;
    form.insertListItem("ingredients", { ...ingredient });
    form.clearFieldError("ingredients");
    setIngredientSearch("");
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
        <Autocomplete
          label="Ингредиенты"
          size="lg"
          placeholder="Начните вводить название ингредиента"
          description="Выберите ингредиент из подсказок, чтобы добавить его в состав"
          withAsterisk
          clearable
          data={availableIngredients.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          value={ingredientSearch}
          onChange={setIngredientSearch}
          comboboxProps={{
            store: ingredientCombobox,
            onOptionSubmit: (id) => {
              addIngredient(id);
              ingredientCombobox.closeDropdown();
            },
          }}
          error={form.errors.ingredients}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
        />
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
