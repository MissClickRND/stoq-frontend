import componentClasses from "./InventoryCheckPage.module.css";
import { useState } from "react";
import { Alert, Button, Group, Paper, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconArrowRight, IconCalendar, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { useInventory, InventorySteps } from "@/features/inventory";

import { InventoryCheckTable } from "../InventoryCheckTable/InventoryCheckTable";
import classes from "../../../classes/Inventory.module.css";

export function InventoryCheckPage() {
  const { entries, date, setDate, updateEntry, prepare } = useInventory();
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const matching = entries.filter((entry) =>
    `${entry.product.title} ${entry.product.article} ${entry.product.supplyId}`
      .toLocaleLowerCase("ru-RU")
      .includes(query),
  );
  return (
    <DefaultPageLayout
      title="Инвентаризация"
      subtitle="Проверьте фактические остатки продуктов на складе"
      disableSearch
      disableStatistics
      beforeStatistics={<InventorySteps active={0} />}
      headerTopSection={
        <PageBreadcrumbs
          parentLabel="Склад"
          parentPath="/store"
          currentLabel="Инвентаризация"
        />
      }
    >
      <Paper withBorder p="md" className={classes.fixed}>
        <Group align="flex-start">
          <TextInput
            size="lg"
            aria-label="Поиск позиций инвентаризации"
            placeholder="Поиск по названию, артикулу или ID поставки"
            leftSection={<IconSearch size={20} />}
            style={{ flex: 1, minWidth: 240 }}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <DatePickerInput
            size="lg"
            className={componentClasses.date}
            aria-label="Дата инвентаризации"
            valueFormat="DD.MM.YYYY"
            placeholder="Выберите дату"
            value={date}
            onChange={(value) => {
              setDate(value);
              setError(null);
            }}
            clearable
            leftSection={<IconCalendar size={20} />}
            error={submitted && !date ? "Выберите дату" : undefined}
          />
        </Group>
      </Paper>
      {error && (
        <Alert
          className={classes.fixed}
          color="red"
          role="alert"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      <InventoryCheckTable
        entries={matching}
        submitted={submitted}
        onChange={(id, patch) => {
          updateEntry(id, patch);
          setError(null);
        }}
      />
      <Group className={classes.footer} justify="flex-end">
        <Button
          size="lg"
          disabled={!entries.length}
          rightSection={<IconArrowRight size={20} />}
          onClick={() => {
            setSubmitted(true);
            if (!prepare())
              return setError(
                !date
                  ? "Выберите дату инвентаризации."
                  : "Заполните фактические остатки всех позиций. При необходимости очистите поиск, чтобы увидеть ошибки.",
              );
            setError(null);
            navigate("/store/inventory/confirm");
          }}
        >
          Перейти к подтверждению
        </Button>
      </Group>
    </DefaultPageLayout>
  );
}
