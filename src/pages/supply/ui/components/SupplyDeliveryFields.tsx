import { Paper, Stack, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconCalendarTime, IconTruckDelivery } from "@tabler/icons-react";

export function SupplyDeliveryFields({
  receivedAt, supplyNumber, submitted, onDateChange, onSupplyNumberChange,
}: {
  receivedAt: string | null;
  supplyNumber: string;
  submitted: boolean;
  onDateChange: (date: string | null) => void;
  onSupplyNumberChange: (value: string) => void;
}) {
  return (
    <Paper withBorder p="lg">
      <Stack gap="lg">
        <TextInput
          label="Номер поставки"
          placeholder="П-2026-0042"
          size="lg"
          required
          value={supplyNumber}
          onChange={(event) => onSupplyNumberChange(event.currentTarget.value)}
          error={submitted && !supplyNumber.trim() ? "Укажите номер поставки" : undefined}
        />
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
          timePickerProps={{ format: "24h", hoursInputLabel: "Часы", minutesInputLabel: "Минуты" }}
          submitButtonProps={{ "aria-label": "Подтвердить дату поступления" }}
        />
        <TextInput label="Поставщик" size="lg" value="—" disabled leftSection={<IconTruckDelivery size={20} />} />
      </Stack>
    </Paper>
  );
}
