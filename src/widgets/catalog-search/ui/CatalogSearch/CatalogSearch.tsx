import { useState, type ReactNode } from "react";
import {
  Combobox,
  InputBase,
  ScrollArea,
  Text,
  useCombobox,
} from "@mantine/core";

export type CatalogSearchProps<T> = {
  items: T[];
  getId: (item: T) => string;
  getSearchText: (item: T) => string;
  renderOption?: (item: T) => ReactNode;
  onSelect: (item: T) => void;
  onSearchChange?: (search: string) => void;
  filterLocally?: boolean;
  loading?: boolean;
  queryError?: ReactNode;
  label?: string;
  description?: ReactNode;
  withAsterisk?: boolean;
  error?: ReactNode;
  placeholder: string;
  emptyText: string;
  renderEmpty?: (search: string) => ReactNode;
};

export function CatalogSearch<T>({
  items,
  getId,
  getSearchText,
  renderOption = getSearchText,
  onSelect,
  onSearchChange,
  filterLocally = true,
  loading = false,
  queryError,
  label,
  description,
  withAsterisk,
  error,
  placeholder,
  emptyText,
  renderEmpty,
}: CatalogSearchProps<T>) {
  const [search, setSearch] = useState("");
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const matching = filterLocally
    ? items.filter((item) =>
        getSearchText(item).toLocaleLowerCase("ru-RU").includes(query),
      )
    : items;
  const changeSearch = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
    combobox.resetSelectedOption();
  };

  return (
    <Combobox
      store={combobox}
      size="lg"
      onOptionSubmit={(id) => {
        if (loading || queryError) return;
        const item = matching.find((item) => getId(item) === id);
        if (!item) return;
        onSelect(item);
        changeSearch("");
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target withExpandedAttribute>
        <InputBase
          size="lg"
          label={label}
          description={description}
          withAsterisk={withAsterisk}
          error={error}
          aria-label={label ? undefined : placeholder}
          placeholder={placeholder}
          value={search}
          autoComplete="off"
          onChange={(event) => {
            changeSearch(event.currentTarget.value);
            combobox.openDropdown();
          }}
          onFocus={() => combobox.openDropdown()}
          onClick={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          rightSectionPointerEvents="auto"
          rightSection={
            search ? (
              <Combobox.ClearButton
                aria-label="Очистить поиск"
                onMouseDown={(event) => event.preventDefault()}
                onClear={() => changeSearch("")}
              />
            ) : undefined
          }
        />
      </Combobox.Target>
      <Combobox.Dropdown data-composed>
        <Combobox.Options aria-label={label ?? placeholder}>
          <ScrollArea.Autosize
            mah={220}
            type="scroll"
            scrollbarSize="var(--combobox-padding)"
            offsetScrollbars="y"
          >
            {loading ? (
              <Combobox.Empty>
                <Text inherit role="status">
                  Загрузка…
                </Text>
              </Combobox.Empty>
            ) : queryError ? (
              <Combobox.Empty>
                <Text inherit c="red" role="alert">
                  {queryError}
                </Text>
              </Combobox.Empty>
            ) : matching.length ? (
              matching.map((item) => (
                <Combobox.Option key={getId(item)} value={getId(item)}>
                  {renderOption(item)}
                </Combobox.Option>
              ))
            ) : renderEmpty ? (
              renderEmpty(search.trim())
            ) : (
              <Combobox.Empty>{emptyText}</Combobox.Empty>
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
