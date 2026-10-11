import { NumberInput, Select } from "@mantine/core";
import { IconTable, IconToolsKitchen2, IconUsers } from "@tabler/icons-react";
import {
  orderTypeOptions,
  tableOptions,
  type OrderDraft,
  type OrderType,
} from "@/entities/order";

type GuestFields = Pick<OrderDraft, "type" | "table" | "guests">;
export function OrderGuestFields({
  value,
  errors,
  onChange,
  guestsClassName,
  withIcons = true,
}: {
  value: GuestFields;
  errors: Partial<Record<"table" | "guests", string>>;
  onChange: (patch: Partial<GuestFields>) => void;
  guestsClassName?: string;
  withIcons?: boolean;
}) {
  return (
    <>
      <Select
        size="lg"
        label="Тип заказа"
        withAsterisk
        data={orderTypeOptions}
        value={value.type}
        allowDeselect={false}
        leftSection={withIcons ? <IconToolsKitchen2 size={20} /> : undefined}
        onChange={(type) => type && onChange({ type: type as OrderType })}
      />
      <Select
        size="lg"
        label="Стол"
        withAsterisk={value.type === "dine-in"}
        data={tableOptions}
        value={value.type === "dine-in" ? value.table : null}
        disabled={value.type === "takeaway"}
        placeholder={
          value.type === "takeaway" ? "Не требуется" : "Выберите стол"
        }
        allowDeselect={false}
        error={errors.table}
        leftSection={withIcons ? <IconTable size={20} /> : undefined}
        onChange={(table) => onChange({ table })}
      />
      <NumberInput
        size="lg"
        label="Количество гостей"
        withAsterisk
        className={guestsClassName}
        value={value.guests}
        min={1}
        allowDecimal={false}
        allowNegative={false}
        error={errors.guests}
        leftSection={withIcons ? <IconUsers size={20} /> : undefined}
        onChange={(guests) => onChange({ guests })}
      />
    </>
  );
}
