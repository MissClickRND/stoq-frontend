import { Outlet } from "react-router-dom";
import { Box, Flex } from "@mantine/core";
import { Navbar, MobileNavigation } from "@/widgets/navbar";
import { useInventoryLiveUpdates } from "@/entities/store";
import { selectUser } from "@/entities/user";
import { useAppSelector } from "@/shared/lib";

function InventoryConnection() {
  useInventoryLiveUpdates();
  return null;
}

export default function MainLayout() {
  const user = useAppSelector(selectUser);
  return (
    <Flex className="appLayout">
      <InventoryConnection key={user.sessionRevision} />
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
