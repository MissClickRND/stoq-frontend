import { NumberInput, Select } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconCalendarTime,
  IconTable,
  IconUsers,
  IconToolsKitchen2,
} from "@tabler/icons-react";
import { orderTypeOptions, tableOptions } from "../../model/data";
import type { OrderDraft, OrderType } from "../../model/type";
import classes from "../Orders.module.css";

export function OrderFields({
  draft,
  errors,
  onChange,
}: {
  draft: OrderDraft;
  errors: Partial<Record<"createdAt" | "table" | "guests", string>>;
  onChange: (patch: Partial<Omit<OrderDraft, "items">>) => void;
}) {
  return (
    <div className={classes.metadata}>
      <DateTimePicker
        size="lg"
        label="Дата и время"
        withAsterisk
        valueFormat="DD.MM.YYYY.HH.mm"
        value={draft.createdAt}
        onChange={(createdAt) => onChange({ createdAt })}
        clearable
        placeholder="дд.мм.гггг.чч.мм"
        error={errors.createdAt}
        leftSection={<IconCalendarTime size={20} />}
        timePickerProps={{
          format: "24h",
          hoursInputLabel: "Часы",
          minutesInputLabel: "Минуты",
        }}
        submitButtonProps={{ "aria-label": "Подтвердить дату заказа" }}
      />
      <Select
        size="lg"
        label="Тип заказа"
        withAsterisk
        data={orderTypeOptions}
        value={draft.type}
        allowDeselect={false}
        leftSection={<IconToolsKitchen2 size={20} />}
        onChange={(type) => type && onChange({ type: type as OrderType })}
      />
      <Select
        size="lg"
        label="Стол"
        withAsterisk={draft.type === "dine-in"}
        data={tableOptions}
        value={draft.type === "dine-in" ? draft.table : null}
        disabled={draft.type === "takeaway"}
        placeholder={
          draft.type === "takeaway" ? "Не требуется" : "Выберите стол"
        }
        allowDeselect={false}
        error={errors.table}
        leftSection={<IconTable size={20} />}
        onChange={(table) => onChange({ table })}
      />
      <NumberInput
        size="lg"
        label="Количество гостей"
        withAsterisk
        value={draft.guests}
        min={1}
        allowDecimal={false}
        allowNegative={false}
        error={errors.guests}
        leftSection={<IconUsers size={20} />}
        onChange={(guests) => onChange({ guests })}
      />
    </div>
  );
}
