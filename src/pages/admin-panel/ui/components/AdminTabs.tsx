import {
  Box,
  Button,
  Group,
  ScrollArea,
  SegmentedControl,
  Text,
} from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { adminTabs } from "../../model/data";
import type { AdminTab } from "../../model/type";
import classes from "../AdminPanel.module.css";

export function AdminTabs({
  tab,
  onChange,
  onAddEmployee,
}: {
  tab: AdminTab;
  onChange: (tab: AdminTab) => void;
  onAddEmployee: () => void;
}) {
  return (
    <Box className={classes.tabs}>
      <ScrollArea type="auto" className={classes.tabControl}>
        <SegmentedControl<AdminTab>
          value={tab}
          onChange={onChange}
          size="lg"
          color="primary"
          autoContrast
          withItemsBorders={false}
          classNames={{ label: classes.tabLabel }}
          data={adminTabs.map((item) => ({
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
        />
      </ScrollArea>
      {tab === "employees" && (
        <Button
          className={classes.addEmployee}
          size="lg"
          leftSection={<IconUserPlus size={20} />}
          onClick={onAddEmployee}
        >
          Добавить сотрудника
        </Button>
      )}
    </Box>
  );
}
