import { Box, Image, Paper, Stack } from "@mantine/core";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { authAssets } from "../model/data";
import classes from "./AuthLayout.module.css";
import { AuthModeSwitch } from "./AuthModeSwitch";

export function AuthLayout() {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  return (
    <Box component="main" className={classes.page}>
      <img
        className={classes.background}
        data-loaded={backgroundLoaded || undefined}
        src={authAssets.background}
        alt=""
        aria-hidden
        onLoad={() => setBackgroundLoaded(true)}
      />
      <Paper data-auth-card className={classes.card} radius="xl" shadow="xl">
        <Stack gap="xl">
          <Image
            src={authAssets.logo}
            alt={authAssets.logoAlt}
            className={classes.logo}
          />
          <AuthModeSwitch />
          <Outlet />
        </Stack>
      </Paper>
    </Box>
  );
}
