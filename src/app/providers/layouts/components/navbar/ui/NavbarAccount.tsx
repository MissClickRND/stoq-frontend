import { Avatar, Box, Group, Skeleton, Stack, Text } from "@mantine/core";

import classes from "./Navbar.module.css";
import { NavbarUser } from "../model/type";

type NavbarAccountProps = { user: NavbarUser | null };

export function NavbarAccount({ user }: NavbarAccountProps) {
  if (!user) {
    return (
      <Group className={classes.profile} wrap="nowrap">
        <Skeleton circle height={48} />
        <Stack gap={6} flex={1}>
          <Skeleton height={13} />
          <Skeleton height={10} width="65%" />
        </Stack>
      </Group>
    );
  }

  return (
    <Group className={classes.profile} wrap="nowrap">
      <Avatar color="primary.8" radius="xl" size={48}>
        {user.initials}
      </Avatar>
      <Box className={classes.profileText}>
        <Text size="sm" fw={700} lineClamp={1}>
          {user.name}
        </Text>
        <Text size="xs" c="white" opacity={0.7}>
          {user.role}
        </Text>
      </Box>
    </Group>
  );
}
