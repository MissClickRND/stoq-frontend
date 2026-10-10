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
    //  const [debounced] = useDebouncedValue(value, 200);

    <Input
      size="lg"
      variant="filled"
      placeholder={searchTitle}
      leftSection={<IconSearch />}
      flex={1}
      maw={1000}
      radius="xl"
      value={searchValue}
      onChange={(e) => setSearchValue(e.currentTarget.value)}
      rightSection={
        searchValue ? (
          <Input.ClearButton
            aria-label="Clear input"
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
