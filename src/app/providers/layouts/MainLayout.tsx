import { Outlet } from "react-router-dom";
import { Box, Flex } from "@mantine/core";
import Navbar from "./components/navbar/ui/Navbar";


export default function MainLayout() {
  return (
    <Flex mih="100dvh" className="appLayout">
      <Navbar />
      <Box component="main" className="appContent"><Outlet /></Box>
    </Flex>
  );
}
