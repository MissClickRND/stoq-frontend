import { Outlet } from "react-router-dom";
import { Box, Flex } from "@mantine/core";
import Navbar from "./components/navbar/ui/Navbar";
import { MobileNavigation } from "./components/MobileNavigation";

export default function MainLayout() {
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
