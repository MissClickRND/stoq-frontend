import { Stack, Text, Title } from "@mantine/core";
import classes from "./TitleSection.module.css";

export default function TitleSection({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Stack gap={4}>
      <Title order={1} className={classes.title}>
        {title}
      </Title>
      <Text c="dimmed" className={classes.subtitle}>
        {subtitle}
      </Text>
    </Stack>
  );
}
