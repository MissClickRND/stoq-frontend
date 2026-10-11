import { Paper, Stack, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconCalendarTime, IconTruckDelivery } from "@tabler/icons-react";

export function SupplyDeliveryFields({
  receivedAt,
  supplier,
  submitted,
  onDateChange,
  onSupplierChange,
}: {
  receivedAt: string | null;
  supplier: string;
  submitted: boolean;
  onDateChange: (date: string | null) => void;
  onSupplierChange: (supplier: string) => void;
}) {
  return (
    <Paper withBorder p="lg">
      <Stack gap="lg">
        <DateTimePicker
          label="Дата и время поступления"
          withAsterisk
          size="lg"
          valueFormat="DD.MM.YYYY.HH.mm"
          placeholder="дд.мм.гггг.чч.мм"
          value={receivedAt}
          onChange={onDateChange}
          clearable
          leftSection={<IconCalendarTime size={20} />}
          error={submitted && !receivedAt ? "Укажите дату и время" : undefined}
          timePickerProps={{
            format: "24h",
            hoursInputLabel: "Часы",
            minutesInputLabel: "Минуты",
          }}
          submitButtonProps={{ "aria-label": "Подтвердить дату поступления" }}
        />
        <TextInput
          label="Поставщик"
          withAsterisk
          size="lg"
          placeholder="Название компании или имя поставщика"
          value={supplier}
          maxLength={200}
          leftSection={<IconTruckDelivery size={20} />}
          onChange={(event) => onSupplierChange(event.currentTarget.value)}
          error={
            submitted && !supplier.trim() ? "Введите поставщика" : undefined
          }
        />
      </Stack>
    </Paper>
  );
}
