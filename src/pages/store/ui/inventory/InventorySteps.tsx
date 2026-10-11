import { Stepper } from "@mantine/core";
import classes from "./Inventory.module.css";

export function InventorySteps({ active }: { active: number }) {
  return (
    <Stepper
      active={active}
      size="sm"
      className={classes.fixed}
      classNames={{ stepBody: classes.stepBody }}
      styles={{ stepLabel: { fontSize: "var(--mantine-font-size-lg)" } }}
    >
      <Stepper.Step label="Проверка остатков" allowStepSelect={false} />
      <Stepper.Step label="Подтверждение изменений" allowStepSelect={false} />
      <Stepper.Step label="Итоговый отчёт" allowStepSelect={false} />
    </Stepper>
  );
}
