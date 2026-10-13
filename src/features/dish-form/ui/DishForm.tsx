import {
  Alert,
  Button,
  Group,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { formRootRule, useForm } from "@mantine/form";
import { useState, type ReactNode } from "react";
import { dishFormDefaults } from "../model/defaults";
import {
  useIngredients,
  useSaveDish,
  type Dish,
  type DishFormValues,
  type DishIngredient,
} from "@/entities/dish";
import { IngredientQuantityFields } from "./IngredientQuantityFields";
import { apiErrorMessage } from "@/shared/lib/api-error";

export type IngredientSearchProps = {
  items: DishIngredient[];
  onSelect: (ingredient: DishIngredient) => void;
  error?: ReactNode;
  loading?: boolean;
  queryError?: ReactNode;
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
  const {
    ingredients,
    isLoading: ingredientsLoading,
    isError: ingredientsError,
    refetch: refetchIngredients,
  } = useIngredients();
  const { saveDish, isSaving } = useSaveDish();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<DishFormValues>({
    mode: "controlled",
    initialValues: dish
      ? {
          name: dish.name,
          category: dish.category ?? "",
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
      category: (value) => (value?.trim() ? null : "Укажите категорию блюда"),
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
  const availableIngredients = ingredients.filter(
    (item) =>
      !form.values.ingredients.some((selected) => selected.id === item.id),
  );
  const addIngredient = (ingredient: DishIngredient) => {
    form.insertListItem("ingredients", { ...ingredient });
    form.clearFieldError("ingredients");
  };
  const submit = form.onSubmit(async (values) => {
    if (isSaving) return;
    setSubmitError(null);
    try {
      const saved = await saveDish(
        {
          ...values,
          name: values.name.trim(),
          description: values.description.trim(),
          imageUrl: values.imageUrl?.trim(),
        },
        dish?.id,
      );
      if (saved) onClose();
      else {
        setSubmitError(
          "Обновление блюда пока не подключено к API. Изменения не сохранены.",
        );
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : apiErrorMessage(error, "Не удалось сохранить блюдо"),
      );
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        {submitError && (
          <Alert color="red" role="alert">{submitError}</Alert>
        )}
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
        <TextInput label="Категория" size="lg" placeholder="Например, салаты" required {...form.getInputProps("category")} />
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
          loading: ingredientsLoading,
          queryError: ingredientsError ? (
            <>
              Не удалось загрузить продукты.
              <Button
                type="button"
                variant="subtle"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => refetchIngredients()}
              >
                Повторить
              </Button>
            </>
          ) : undefined,
        })}
        <IngredientQuantityFields
          ingredients={form.values.ingredients}
          getQuantityInputProps={(index) =>
            form.getInputProps(`ingredients.${index}.quantity`)
          }
          onRemove={(index) => form.removeListItem("ingredients", index)}
        />
        <Group justify="flex-end">
          <Button
            type="button"
            size="lg"
            variant="default"
            disabled={isSaving}
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            size="lg"
            loading={isSaving}
            disabled={ingredientsLoading || ingredientsError}
          >
            {dish ? "Сохранить изменения" : "Добавить блюдо"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
