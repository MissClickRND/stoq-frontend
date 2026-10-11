import componentClasses from "./Navbar.module.css";
import { Box, Divider, Stack } from "@mantine/core";
import { NavbarAccount } from "../NavbarAccount/NavbarAccount";
import { NavbarActions } from "../NavbarActions/NavbarActions";
import { NavbarBrand } from "../NavbarBrand/NavbarBrand";
import { NavbarNavigation } from "../NavbarNavigation/NavbarNavigation";

import { useAccount } from "@/entities/user";

export default function Navbar() {
  const { account: navbarUser } = useAccount();
  return (
    <Box component="aside" className={componentClasses.navbar}>
      <Stack
        className={componentClasses.content}
        gap={0}
        justify="space-between"
      >
        <Box style={{ flexShrink: 0 }}>
          <NavbarBrand />
          <NavbarNavigation />
        </Box>
        <Box mt="auto" style={{ flexShrink: 0 }}>
          <Divider className={componentClasses.divider} />
          <NavbarAccount user={navbarUser} />
          <Divider className={componentClasses.divider} />
          <NavbarActions />
        </Box>
      </Stack>
    </Box>
  );
}
