import type { IUnit } from "@/entities/unit";
import componentClasses from "./SupplyProductCard.module.css";
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
import {
  calculateItemPrices,
  validateItem,
  type SupplyItemDraft,
} from "@/entities/supply";

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
  units: IUnit[];
  receivedAt: string | null;
  submitted: boolean;
  onChange: (patch: Partial<SupplyItemDraft>) => void;
  onRemove: () => void;
  onAddUnit: () => void;
}) {
  const unitOptions = units.some((unit) => unit.id === item.product.unitId)
    ? units
    : [item.product.unit, ...units];
  const prices = calculateItemPrices(item);
  const errors = submitted ? validateItem(item, receivedAt) : {};
  return (
    <div className={componentClasses.productRow}>
      <Group
        className={componentClasses.productIdentity}
        gap="sm"
        wrap="nowrap"
      >
        <ThemeIcon size={42} radius="md" variant="light">
          <IconPackage size={23} />
        </ThemeIcon>
        <div>
          <Text size="lg" fw={600}>
            {item.product.name}
          </Text>
          <Text size="sm" c="dimmed">
            ID {item.product.id}
          </Text>
        </div>
      </Group>
      <div>
        <NumberInput
          size="lg"
          label="Количество"
          classNames={{ label: componentClasses.fieldLabel }}
          aria-label={"Количество " + item.product.name}
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
        <Text className={componentClasses.fieldLabel} size="sm" fw={500}>
          Ед. измерения
        </Text>
        <Group gap={6} align="flex-start" wrap="nowrap">
          <Select
            size="lg"
            style={{ flex: 1, minWidth: 0 }}
            aria-label={"Ед. измерения " + item.product.name}
            data={unitOptions.map((unit) => ({ value: String(unit.id), label: unit.shortName }))}
            value={item.unitId === null ? null : String(item.unitId)}
            allowDeselect={false}
            error={errors.unitId}
            onChange={(unitId) => onChange({ unitId: unitId ? Number(unitId) : null })}
          />
          <Tooltip label="Создать единицу измерения">
            <ActionIcon
              size="lg"
              mt={8}
              variant="light"
              aria-label={"Создать единицу измерения для " + item.product.name}
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
          classNames={{ label: componentClasses.fieldLabel }}
          aria-label={"Годен до " + item.product.name}
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
          classNames={{ label: componentClasses.fieldLabel }}
          aria-label={"Цена за единицу " + item.product.name}
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
          classNames={{ label: componentClasses.fieldLabel }}
          aria-label={"Сумма позиции " + item.product.name}
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
          className={componentClasses.removeProduct}
          variant="light"
          color="red"
          size="lg"
          aria-label={"Удалить " + item.product.name}
          onClick={onRemove}
        >
          <IconTrash size={20} />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
