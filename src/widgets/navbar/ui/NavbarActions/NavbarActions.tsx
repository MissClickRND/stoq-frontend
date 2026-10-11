import componentClasses from "./NavbarActions.module.css";
import { submitLogout } from "@/entities/auth";
import { Button, Stack } from "@mantine/core";

import classes from "../../classes/Navbar.module.css";
import { navbarActions } from "../../model/config";
import { NavbarSettings } from "../NavbarSettings";

export function NavbarActions() {
  return (
    <Stack gap={4} className={componentClasses.actions}>
      <NavbarSettings />
      {navbarActions.map((action) => (
        <Button
          key={action.label}
          onClick={submitLogout}
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
