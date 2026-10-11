import { Button, Menu, useMantineColorScheme } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import { colorSchemeOptions, navbarSettings } from "../model/config";
import classes from "../classes/Navbar.module.css";

export function NavbarSettings() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Menu position="right-end" shadow="md" width={190} withinPortal>
      <Menu.Target>
        <Button
          className={classes.actionButton}
          variant="subtle"
          justify="start"
          leftSection={<navbarSettings.icon size={20} />}
        >
          {navbarSettings.label}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{navbarSettings.colorSchemeLabel}</Menu.Label>
        {colorSchemeOptions.map((option) => (
          <Menu.Item
            key={option.value}
            leftSection={<option.icon size={17} />}
            rightSection={
              colorScheme === option.value ? <IconCheck size={16} /> : null
            }
            onClick={() => setColorScheme(option.value)}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
