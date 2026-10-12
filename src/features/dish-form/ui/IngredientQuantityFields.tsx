import {
  ActionIcon,
  Box,
  Divider,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import type { NumberInputProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { DishIngredient } from "@/entities/dish";

export function IngredientQuantityFields({
  ingredients,
  getQuantityInputProps,
  onRemove,
}: {
  ingredients: DishIngredient[];
  getQuantityInputProps: (index: number) => NumberInputProps;
  onRemove: (index: number) => void;
}) {
  return (
    <Paper withBorder radius="md" p="md">
      <ScrollArea.Autosize mah={260} offsetScrollbars type="auto">
        <Stack gap="md">
          {ingredients.length === 0 && (
            <Text size="sm" c="dimmed">
              Выбранные ингредиенты появятся здесь. Укажите количество на
              порцию.
            </Text>
          )}
          {ingredients.map((ingredient, index) => (
            <Box key={ingredient.id} w="100%">
              {index > 0 && <Divider mb="md" />}
              <Group justify="space-between" align="center" gap="md">
                <Text size="lg" fw={600} flex="1" miw={120}>
                  {ingredient.name}
                </Text>
                <Group gap="sm" wrap="nowrap" align="center">
                  <NumberInput
                    w={170}
                    size="lg"
                    min={0.001}
                    step={ingredient.unit === "шт." ? 1 : 0.01}
                    decimalScale={3}
                    label={`На порцию (${ingredient.unit})`}
                    aria-label={`Количество на порцию: ${ingredient.name}, ${ingredient.unit}`}
                    {...getQuantityInputProps(index)}
                  />
                  <ActionIcon
                    type="button"
                    size="lg"
                    variant="subtle"
                    color="red"
                    aria-label={`Удалить ингредиент ${ingredient.name}`}
                    onClick={() => onRemove(index)}
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                </Group>
              </Group>
            </Box>
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Paper>
  );
}
