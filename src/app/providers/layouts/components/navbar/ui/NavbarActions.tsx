import { Button, Stack } from "@mantine/core";

import classes from "./Navbar.module.css";
import { navbarActions } from "../model/data";
import { NavbarSettings } from "./NavbarSettings";

export function NavbarActions() {
  return (
    <Stack gap={4} className={classes.actions}>
      <NavbarSettings />
      {navbarActions.map((action) => (
        <Button
          key={action.label}
          className={classes.actionButton}
          variant="subtle"
          justify="start"
          leftSection={<action.icon size={20} />}
        >
          {action.label}
        </Button>
      ))}
    </Stack>
  );
}
