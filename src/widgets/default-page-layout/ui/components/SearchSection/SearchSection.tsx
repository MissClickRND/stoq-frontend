import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import classes from "./SearchSection.module.css";
export default function SearchSection({
  searchTitle,
  searchValue,
  setSearchValue,
}: {
  searchTitle: string;
  searchValue: string;
  setSearchValue: (value: string) => void;
}) {
  return (
    <Input
      size="lg"
      variant="filled"
      placeholder={searchTitle}
      aria-label={searchTitle}
      leftSection={<IconSearch />}
      flex={1}
      maw={1000}
      radius="xl"
      value={searchValue}
      onChange={(e) => setSearchValue(e.currentTarget.value)}
      rightSection={
        searchValue ? (
          <Input.ClearButton
            aria-label="Очистить поиск"
            onClick={() => setSearchValue("")}
          />
        ) : null
      }
      classNames={{
        input: classes.input,
      }}
    />
  );
}
