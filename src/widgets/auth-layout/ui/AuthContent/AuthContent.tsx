import componentClasses from "./AuthContent.module.css";
import { Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

type AuthContentProps = {
  title: string;
  description: string;
  children: ReactNode;
  layout?: "default" | "wide";
};

export function AuthContent({
  title,
  description,
  children,
  layout = "default",
}: AuthContentProps) {
  return (
    <Stack gap="xl" data-auth-content={layout}>
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
