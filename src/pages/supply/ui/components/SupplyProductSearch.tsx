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
import { IconPackage, IconSearch, IconX } from "@tabler/icons-react";
import { supplyProducts } from "../../model/data";
import { SupplyProduct } from "../../model/type";

export function SupplyProductSearch({
  onSelect,
}: {
  onSelect: (product: SupplyProduct) => void;
}) {
  const [search, setSearch] = useState("");
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const products = supplyProducts.filter((product) =>
    `${product.title} ${product.article}`
      .toLocaleLowerCase("ru-RU")
      .includes(query),
  );

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(id) => {
        const product = supplyProducts.find((entry) => entry.id === id);
        if (product) onSelect(product);
        setSearch("");
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          size="lg"
          placeholder="Начните вводить название или артикул"
          value={search}
          leftSection={<IconSearch size={20} />}
          autoComplete="off"
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
                aria-label="Очистить поиск продуктов"
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
            {products.length ? (
              products.map((product) => (
                <Combobox.Option key={product.id} value={product.id}>
                  <Group gap="sm">
                    <ThemeIcon variant="light" size={32}>
                      <IconPackage size={18} />
                    </ThemeIcon>
                    <div>
                      <Text size="lg" fw={600}>
                        {product.title}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Артикул {product.article} · {product.unit}
                      </Text>
                    </div>
                  </Group>
                </Combobox.Option>
              ))
            ) : (
              <Combobox.Empty>Продукты не найдены</Combobox.Empty>
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
