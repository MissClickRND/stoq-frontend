import { useState, type ReactNode } from "react";
import {
  ActionIcon,
  Combobox,
  ScrollArea,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";

type CatalogSearchProps<T> = {
  items: T[];
  getId: (item: T) => string;
  getSearchText: (item: T) => string;
  renderOption: (item: T) => ReactNode;
  onSelect: (item: T) => void;
  placeholder: string;
  label?: string;
  emptyText: string;
};

export function CatalogSearch<T>({
  items,
  getId,
  getSearchText,
  renderOption,
  onSelect,
  placeholder,
  label,
  emptyText,
}: CatalogSearchProps<T>) {
  const [search, setSearch] = useState("");
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const matching = items.filter((item) =>
    getSearchText(item).toLocaleLowerCase("ru-RU").includes(query),
  );
  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(id) => {
        const item = items.find((item) => getId(item) === id);
        if (item) onSelect(item);
        setSearch("");
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          size="lg"
          label={label}
          aria-label={label ?? placeholder}
          placeholder={placeholder}
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
                aria-label="Очистить поиск"
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
              matching.map((item) => (
                <Combobox.Option key={getId(item)} value={getId(item)}>
                  {renderOption(item)}
                </Combobox.Option>
              ))
            ) : (
              <Combobox.Empty>{emptyText}</Combobox.Empty>
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
