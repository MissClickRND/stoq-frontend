import componentClasses from "./OrderFields.module.css";
import { DateTimePicker } from "@mantine/dates";
import { IconCalendarTime } from "@tabler/icons-react";
import type { OrderDraft } from "@/entities/order";

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
    <div className={componentClasses.metadata}>
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
      <OrderGuestFields value={draft} errors={errors} onChange={onChange} />
    </div>
  );
}

import { OrderGuestFields } from "../OrderGuestFields";
