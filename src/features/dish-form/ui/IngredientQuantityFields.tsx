import { Group, NumberInput, Stack, Text } from "@mantine/core";
import type { DishIngredient } from "@/entities/dish";

export function IngredientQuantityFields({
  ingredients,
  onChange,
}: {
  ingredients: DishIngredient[];
  onChange: (id: string, quantity: number) => void;
}) {
  return (
    <Stack gap="xs">
      {ingredients.map((ingredient) => (
        <Group key={ingredient.id} justify="space-between" wrap="nowrap">
          <Text size="sm">{ingredient.name}</Text>
          <NumberInput
            w={150}
            min={0.001}
            step={ingredient.unit === "шт." ? 1 : 0.01}
            decimalScale={3}
            label={`На порцию (${ingredient.unit})`}
            value={ingredient.quantity}
            onChange={(value) => onChange(ingredient.id, Number(value))}
          />
        </Group>
      ))}
    </Stack>
  );
}
