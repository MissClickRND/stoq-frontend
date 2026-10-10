import { Box, Divider, Stack } from "@mantine/core";
import { NavbarAccount } from "./NavbarAccount";
import { NavbarActions } from "./NavbarActions";
import { NavbarBrand } from "./NavbarBrand";
import { NavbarNavigation } from "./NavbarNavigation";

import classes from "./Navbar.module.css";
import { navbarUser } from "../model/data";

export default function Navbar() {
  return (
    <Box component="aside" className={classes.navbar}>
      <Stack h="100%" gap={0}>
        <NavbarBrand />
        <NavbarNavigation />
        <Box mt="auto">
          <Divider className={classes.divider} />
          <NavbarAccount user={navbarUser} />
          <Divider className={classes.divider} />
          <NavbarActions />
        </Box>
      </Stack>
    </Box>
  );
}
