import componentClasses from "./AuthLayout.module.css";
import { Box, Image, Paper, Stack } from "@mantine/core";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { authAssets } from "../../model/config";

import { AuthModeSwitch } from "../AuthModeSwitch/AuthModeSwitch";

export function AuthLayout() {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  return (
    <Box component="main" className={componentClasses.page}>
      <img
        className={componentClasses.background}
        data-loaded={backgroundLoaded || undefined}
        src={authAssets.background}
        alt=""
        aria-hidden
        onLoad={() => setBackgroundLoaded(true)}
      />
      <Paper
        data-auth-card
        className={componentClasses.card}
        radius="xl"
        shadow="xl"
      >
        <Stack gap="xl">
          <Image
            src={authAssets.logo}
            alt={authAssets.logoAlt}
            className={componentClasses.logo}
          />
          <AuthModeSwitch />
          <Outlet />
        </Stack>
      </Paper>
    </Box>
  );
}
