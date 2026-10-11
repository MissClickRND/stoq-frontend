import componentClasses from "./NavbarAccount.module.css";
import { Avatar, Box, Group, Skeleton, Stack, Text } from "@mantine/core";

import { NavbarUser } from "../../model/type";

type NavbarAccountProps = { user: NavbarUser | null };

export function NavbarAccount({ user }: NavbarAccountProps) {
  if (!user) {
    return (
      <Group className={componentClasses.profile} wrap="nowrap">
        <Skeleton circle height={48} />
        <Stack gap={6} flex={1}>
          <Skeleton height={13} />
          <Skeleton height={10} width="65%" />
        </Stack>
      </Group>
    );
  }

  return (
    <Group className={componentClasses.profile} wrap="nowrap">
      <Avatar
        variant="filled"
        color="var(--mantine-color-primary-8)"
        radius="xl"
        size={48}
      >
        <span style={{ color: "white" }}>{user.initials}</span>
      </Avatar>
      <Box className={componentClasses.profileText}>
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
