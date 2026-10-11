import { useState } from "react";
import {
  ActionIcon,
  Combobox,
  Group,
  ScrollArea,
  Text,
  TextInput,
  ThemeIcon,
  useCombobox,
} from "@mantine/core";
import { IconChefHat, IconSearch, IconX } from "@tabler/icons-react";
import type { Dish } from "@/pages/dishes/model/type";
import { formatOrderMoney } from "../../model/format";

export function OrderDishSearch({
  dishes,
  onSelect,
}: {
  dishes: Dish[];
  onSelect: (dish: Dish) => void;
}) {
  const [search, setSearch] = useState("");
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const matching = dishes.filter((dish) =>
    `${dish.name} ${dish.description} ${dish.ingredients.map((ingredient) => ingredient.name).join(" ")}`
      .toLocaleLowerCase("ru-RU")
      .includes(query),
  );
  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(id) => {
        const dish = dishes.find((item) => item.id === id);
        if (dish) onSelect(dish);
        setSearch("");
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          size="lg"
          label="Добавить блюдо"
          placeholder="Начните вводить название блюда или ингредиента"
          value={search}
          autoComplete="off"
          leftSection={<IconSearch size={20} />}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            combobox.openDropdown();
            combobox.resetSelectedOption();
          }}
          onFocus={() => combobox.openDropdown()}
          onClick={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          rightSection={
            search ? (
              <ActionIcon
                size="lg"
                variant="subtle"
                color="gray"
                aria-label="Очистить поиск блюд"
                onClick={() => {
                  setSearch("");
                  combobox.resetSelectedOption();
                }}
              >
                <IconX size={20} />
              </ActionIcon>
            ) : undefined
          }
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          <ScrollArea.Autosize mah={280} type="auto">
            {matching.length ? (
              matching.map((dish) => (
                <Combobox.Option key={dish.id} value={dish.id}>
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <ThemeIcon variant="light" size={38}>
                        <IconChefHat size={22} />
                      </ThemeIcon>
                      <div>
                        <Text size="lg" fw={600}>
                          {dish.name}
                        </Text>
                        <Text size="sm" c="dimmed" lineClamp={1}>
                          {dish.description}
                        </Text>
                      </div>
                    </Group>
                    <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
                      {formatOrderMoney(dish.price)}
                    </Text>
                  </Group>
                </Combobox.Option>
              ))
            ) : (
              <Combobox.Empty>Блюда не найдены</Combobox.Empty>
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
