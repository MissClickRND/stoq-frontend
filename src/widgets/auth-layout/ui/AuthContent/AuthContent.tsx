import componentClasses from "./AuthContent.module.css";
import { Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

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
        <Title order={1} className={componentClasses.title}>
          {title}
        </Title>
        <Text className={componentClasses.description}>{description}</Text>
      </Stack>
      {children}
    </Stack>
  );
}
