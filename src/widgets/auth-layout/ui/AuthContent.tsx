import { Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";
import classes from "./AuthLayout.module.css";

type AuthContentProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthContent({
  title,
  description,
  children,
}: AuthContentProps) {
  return (
    <Stack gap="xl">
      <Stack gap="xs" ta="center">
        <Title order={1} className={classes.title}>
          {title}
        </Title>
        <Text className={classes.description}>{description}</Text>
      </Stack>
      {children}
    </Stack>
  );
}
