import {
  Box,
  Button,
  Group,
  SegmentedControl,
  ScrollArea,
  Text,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { dishModes } from "../../model/data";
import type { DishMode } from "../../model/type";
import classes from "./DishesTopSection.module.css";

export function DishesTopSection({
  mode,
  onModeChange,
  onAdd,
}: {
  mode: DishMode;
  onModeChange: (mode: DishMode) => void;
  onAdd: () => void;
}) {
  return (
    <Box className={classes.section}>
      <ScrollArea type="auto" className={classes.modes}>
        <SegmentedControl<DishMode>
          size="lg"
          value={mode}
          onChange={onModeChange}
          data={dishModes.map((item) => ({
            value: item.value,
            label: (
              <Group gap={8} wrap="nowrap" justify="center">
                <item.icon size={20} aria-hidden />
                <Text size="inherit" fw="inherit">
                  {item.label}
                </Text>
              </Group>
            ),
          }))}
          withItemsBorders={false}
          classNames={{
            root: classes.control,
            indicator: classes.indicator,
            label: classes.label,
          }}
          color="primary"
          autoContrast
        />
      </ScrollArea>
      <Button
        size="lg"
        className={classes.addButton}
        leftSection={<IconPlus size={17} />}
        onClick={onAdd}
      >
        Добавить блюдо
      </Button>
    </Box>
  );
}
