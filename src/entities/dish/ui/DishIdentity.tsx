import { Box, Center, Group, Image, Text } from "@mantine/core";
import { IconSoupFilled } from "@tabler/icons-react";
import type { IDish } from "../model/type";

type DishIdentityData = Pick<IDish, "name"> &
  Partial<Pick<IDish, "description" | "imageUrl" | "imageURL">>;

export function DishIdentity({ dish }: { dish: DishIdentityData }) {
  const imageUrl = dish.imageURL ?? dish.imageUrl;
  return (
    <Group wrap="nowrap" gap="md" miw={360} maw={480}>
      {imageUrl ? (
        <Image
          src={imageUrl}
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
      </Box>
    </Group>
  );
}
