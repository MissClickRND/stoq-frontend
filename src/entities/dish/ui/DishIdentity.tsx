import { Box, Center, Group, Image, Text } from "@mantine/core";
import { IconSoupFilled } from "@tabler/icons-react";
import type { Dish } from "../model/view";

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
          fallbackSrc="https://placehold.co/900x400?text=Тут могла быть ваша реклама"
        />
      ) : (
        <Center style={{ flexShrink: 0 }} w={112} h={76} bg="#DDDDDD" bdrs="md">
          <IconSoupFilled color="gray" size={48} />
        </Center>
      )}
      <Box style={{ minWidth: 0 }}>
        <Text size="lg" fw={600}>
          {dish.name}
        </Text>
        <Text size="sm" c="dimmed" lineClamp={2}>
          {dish.description}
        </Text>
        <Text size="sm" c="dimmed">{dish.category || 'Без категории'}</Text>
      </Box>
    </Group>
  );
}
