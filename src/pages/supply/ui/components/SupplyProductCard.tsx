import {
  ActionIcon,
  Group,
  NumberInput,
  Select,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconPackage,
  IconTrash,
  IconPlus,
  IconCalendarTime,
} from "@tabler/icons-react";
import { calculateItemPrices, validateItem } from "../../model/calculations";
import type { SupplyItemDraft } from "../../model/type";
import classes from "./SupplyForm.module.css";

export function SupplyProductCard({
  item,
  units,
  receivedAt,
  submitted,
  onChange,
  onRemove,
  onAddUnit,
}: {
  item: SupplyItemDraft;
  units: string[];
  receivedAt: string | null;
  submitted: boolean;
  onChange: (patch: Partial<SupplyItemDraft>) => void;
  onRemove: () => void;
  onAddUnit: () => void;
}) {
  const prices = calculateItemPrices(item);
  const errors = submitted ? validateItem(item, receivedAt) : {};
  return (
    <div className={classes.productRow}>
      <Group className={classes.productIdentity} gap="sm" wrap="nowrap">
        <ThemeIcon size={42} radius="md" variant="light">
          <IconPackage size={23} />
        </ThemeIcon>
        <div>
          <Text size="lg" fw={600}>
            {item.product.title}
          </Text>
          <Text size="sm" c="dimmed">
            Арт. {item.product.article}
          </Text>
        </div>
      </Group>
      <div>
        <NumberInput
          size="lg"
          label="Количество"
          classNames={{ label: classes.fieldLabel }}
          aria-label={"Количество " + item.product.title}
          placeholder="0"
          value={item.quantity}
          min={0}
          decimalScale={3}
          decimalSeparator=","
          allowNegative={false}
          error={errors.quantity}
          styles={{ input: { fontWeight: 700 } }}
          onChange={(quantity) => onChange({ quantity })}
        />
      </div>
      <div>
        <Text className={classes.fieldLabel} size="sm" fw={500}>
          Ед. измерения
        </Text>
        <Group gap={6} align="flex-start" wrap="nowrap">
          <Select
            size="lg"
            style={{ flex: 1, minWidth: 0 }}
            aria-label={"Ед. измерения " + item.product.title}
            data={units}
            value={item.unit}
            allowDeselect={false}
            error={errors.unit}
            onChange={(unit) => onChange({ unit: unit ?? "" })}
          />
          <Tooltip label="Создать единицу измерения">
            <ActionIcon
              size="lg"
              mt={8}
              variant="light"
              aria-label={"Создать единицу измерения для " + item.product.title}
              onClick={onAddUnit}
            >
              <IconPlus size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </div>
      <div>
        <DateTimePicker
          size="lg"
          label="Годен до"
          classNames={{ label: classes.fieldLabel }}
          aria-label={"Годен до " + item.product.title}
          valueFormat="DD.MM.YYYY.HH.mm"
          placeholder="дд.мм.гггг.чч.мм"
          value={item.expiresAt}
          onChange={(expiresAt) => onChange({ expiresAt })}
          minDate={receivedAt ?? undefined}
          clearable
          error={errors.expiresAt}
          leftSection={<IconCalendarTime size={20} />}
          timePickerProps={{
            format: "24h",
            hoursInputLabel: "Часы",
            minutesInputLabel: "Минуты",
          }}
          submitButtonProps={{ "aria-label": "Подтвердить срок годности" }}
        />
      </div>
      <div>
        <NumberInput
          size="lg"
          label="Цена за единицу"
          classNames={{ label: classes.fieldLabel }}
          aria-label={"Цена за единицу " + item.product.title}
          placeholder="0"
          suffix=" ₽"
          min={0}
          decimalScale={2}
          decimalSeparator=","
          allowNegative={false}
          hideControls
          value={
            item.pricingMode === "unit"
              ? item.price
              : Math.round(prices.unitPrice * 100) / 100
          }
          error={item.pricingMode === "unit" ? errors.price : undefined}
          styles={{ input: { fontWeight: 600 } }}
          onChange={(price) => onChange({ price, pricingMode: "unit" })}
        />
      </div>
      <div>
        <NumberInput
          size="lg"
          label="Сумма позиции"
          classNames={{ label: classes.fieldLabel }}
          aria-label={"Сумма позиции " + item.product.title}
          placeholder="0"
          suffix=" ₽"
          min={0}
          decimalScale={2}
          decimalSeparator=","
          allowNegative={false}
          hideControls
          value={item.pricingMode === "total" ? item.price : prices.total}
          error={item.pricingMode === "total" ? errors.price : undefined}
          styles={{ input: { fontWeight: 700 } }}
          onChange={(price) => onChange({ price, pricingMode: "total" })}
        />
      </div>
      <Tooltip label="Удалить продукт">
        <ActionIcon
          className={classes.removeProduct}
          variant="light"
          color="red"
          size="lg"
          aria-label={"Удалить " + item.product.title}
          onClick={onRemove}
        >
          <IconTrash size={20} />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
