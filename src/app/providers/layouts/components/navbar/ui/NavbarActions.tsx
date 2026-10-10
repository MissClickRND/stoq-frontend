import { Button, Stack } from "@mantine/core";

import classes from "./Navbar.module.css";
import { navbarActions } from "../model/data";

export function NavbarActions() {
  return (
    <Stack gap={4} className={classes.actions}>
      {navbarActions.map((action) => (
        <Button
          key={action.label}
          variant="subtle"
          color="secondary"
          justify="start"
          leftSection={<action.icon size={20} />}
        >
          {action.label}
        </Button>
      ))}
    </Stack>
  );
}
