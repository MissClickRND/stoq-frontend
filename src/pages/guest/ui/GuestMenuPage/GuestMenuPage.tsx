import componentClasses from "./GuestMenuPage.module.css";
import { useState } from "react";
import {
  Group,
  Pagination,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useDishes } from "@/entities/dish";
import { GuestDishCard } from "../components/GuestDishCard/GuestDishCard";
import classes from "../../classes/Guest.module.css";

const pageSize = 6;
export function GuestMenuPage() {
  const { dishes } = useDishes();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const matching = dishes.filter(
    (dish) =>
      !dish.archived &&
      `${dish.name} ${dish.description} ${dish.ingredients.map((ingredient) => ingredient.name).join(" ")}`
        .toLocaleLowerCase("ru-RU")
        .includes(query),
  );
  const totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
  const activePage = Math.min(page, totalPages);
  const offset = (activePage - 1) * pageSize;
  const visible = matching.slice(offset, offset + pageSize);
  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} className={classes.title}>
            Меню
          </Title>
          <Text c="dimmed" mt="xs">
            Выберите любимые блюда и добавьте их в корзину
          </Text>
        </div>
        <TextInput
          size="lg"
          className={componentClasses.search}
          aria-label="Поиск блюд в гостевом меню"
          placeholder="Название блюда или ингредиент"
          leftSection={<IconSearch size={20} />}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }}
        />
      </Group>
      {visible.length ? (
        <SimpleGrid cols={{ base: 1, xs: 2, lg: 3 }} spacing="lg">
          {visible.map((dish) => (
            <GuestDishCard key={dish.id} dish={dish} />
          ))}
        </SimpleGrid>
      ) : (
        <Paper withBorder p="xl">
          <Text ta="center" c="dimmed">
            Блюда не найдены. Попробуйте другой запрос.
          </Text>
        </Paper>
      )}
      <Group justify="space-between" className={componentClasses.menuBottom}>
        <Text size="sm" c="dimmed">
          {matching.length
            ? `Показано ${offset + 1}–${offset + visible.length} из ${matching.length} блюд`
            : "Найдено: 0 блюд"}
        </Text>
        {totalPages > 1 && (
          <Pagination
            size="lg"
            value={activePage}
            onChange={setPage}
            total={totalPages}
            getItemProps={(value) => ({ "aria-label": `Страница ${value}` })}
          />
        )}
      </Group>
    </Stack>
  );
}
