import {
  Alert,
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { dishFormDefaults, ingredientCatalog } from "../../../model/data";
import { dishCost, formatMoney } from "../../../model/calculations";
import { useDishes } from "../../../model/DishesProvider";
import type { Dish, DishDraft } from "../../../model/type";
import { IngredientQuantityFields } from "./IngredientQuantityFields";

export function DishForm({
  dish,
  onClose,
}: {
  dish?: Dish;
  onClose: () => void;
}) {
  const { saveDish } = useDishes();
  const [draft, setDraft] = useState<DishDraft>(
    dish
      ? { ...dish, ingredients: dish.ingredients.map((item) => ({ ...item })) }
      : { ...dishFormDefaults, ingredients: [] },
  );
  const [error, setError] = useState<string | null>(null);
  const cost = dishCost({ ...draft, id: "draft", sales: [] });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !draft.name.trim() ||
      !draft.description.trim() ||
      draft.price <= 0 ||
      !Number.isFinite(draft.price) ||
      !draft.ingredients.length ||
      draft.ingredients.some(
        (item) => item.quantity <= 0 || !Number.isFinite(item.quantity),
      )
    ) {
      setError(
        "Укажите название, описание, положительную цену и хотя бы один ингредиент с количеством на порцию.",
      );
      return;
    }
    if (draft.imageUrl && !/^(https?:\/\/|\/)/.test(draft.imageUrl)) {
      setError(
        "Укажите адрес изображения с http://, https:// или путь из public.",
      );
      return;
    }
    saveDish(
      {
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim(),
      },
      dish?.id,
    );
    onClose();
  };

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        {error && (
          <Alert color="red" role="alert">
            {error}
          </Alert>
        )}
        <TextInput
          label="Название блюда"
          required
          value={draft.name}
          onChange={(event) =>
            setDraft({ ...draft, name: event.currentTarget.value })
          }
        />
        <Textarea
          label="Описание"
          required
          value={draft.description}
          onChange={(event) =>
            setDraft({ ...draft, description: event.currentTarget.value })
          }
        />
        <NumberInput
          label="Цена продажи, ₽"
          required
          min={0.01}
          decimalScale={2}
          value={draft.price}
          onChange={(value) => setDraft({ ...draft, price: Number(value) })}
        />
        <TextInput
          label="Адрес изображения"
          placeholder="Необязательно"
          value={draft.imageUrl ?? ""}
          onChange={(event) =>
            setDraft({ ...draft, imageUrl: event.currentTarget.value })
          }
        />
        <MultiSelect
          label="Ингредиенты"
          required
          searchable
          data={ingredientCatalog.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          value={draft.ingredients.map((item) => item.id)}
          onChange={(ids) =>
            setDraft({
              ...draft,
              ingredients: ids.map(
                (id) =>
                  draft.ingredients.find((item) => item.id === id) ?? {
                    ...ingredientCatalog.find((item) => item.id === id)!,
                  },
              ),
            })
          }
        />
        <IngredientQuantityFields
          ingredients={draft.ingredients}
          onChange={(id, quantity) =>
            setDraft({
              ...draft,
              ingredients: draft.ingredients.map((item) =>
                item.id === id ? { ...item, quantity } : item,
              ),
            })
          }
        />
        <Text size="sm" c="dimmed">
          Себестоимость порции: {formatMoney(cost)}
        </Text>
        <Switch
          label="Поместить в стоп-лист"
          checked={draft.stopped}
          onChange={(event) =>
            setDraft({
              ...draft,
              stopped: event.currentTarget.checked,
              stopReason: event.currentTarget.checked ? draft.stopReason : "",
            })
          }
        />
        {draft.stopped && (
          <TextInput
            label="Причина остановки"
            value={draft.stopReason ?? ""}
            onChange={(event) =>
              setDraft({ ...draft, stopReason: event.currentTarget.value })
            }
          />
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">
            {dish ? "Сохранить изменения" : "Добавить блюдо"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
