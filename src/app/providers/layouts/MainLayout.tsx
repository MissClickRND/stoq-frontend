import { Outlet } from "react-router-dom";
import { Box, Flex } from "@mantine/core";
import { Navbar, MobileNavigation } from "@/widgets/navbar";
import { useInventoryLiveUpdates } from "@/entities/store";

export default function MainLayout() {
  useInventoryLiveUpdates();
  return (
    <Flex className="appLayout">
      <Box className="desktopNavbar">
        <Navbar />
      </Box>
      <MobileNavigation />
      <Box component="main" className="appContent">
        <Outlet />
      </Box>
    </Flex>
  );
}
