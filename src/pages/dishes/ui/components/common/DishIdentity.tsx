import { Box, Group, Image, Text, ThemeIcon } from "@mantine/core";
import { IconChefHat } from "@tabler/icons-react";
import type { Dish } from "../../../model/type";

export function DishIdentity({ dish }: { dish: Dish }) {
  return (
    <Group wrap="nowrap" gap="md" miw={360} maw={480}>
      {dish.imageUrl ? (
        <Image
          src={dish.imageUrl}
          alt={dish.name}
          w={112}
          h={76}
          radius="md"
          fit="cover"
          style={{ flexShrink: 0 }}
        />
      ) : (
        <ThemeIcon variant="light" color="primary" size={60} radius="md">
          <IconChefHat size={28} />
        </ThemeIcon>
      )}
      <Box style={{ minWidth: 0 }}>
        <Text size="md" fw={700}>
          {dish.name}
        </Text>
        <Text size="sm" c="dimmed" lineClamp={2}>
          {dish.description}
        </Text>
      </Box>
    </Group>
  );
}
