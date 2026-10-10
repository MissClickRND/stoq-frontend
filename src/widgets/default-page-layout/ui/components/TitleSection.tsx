import { Title, Stack, Text } from "@mantine/core";

export default function TitleSection({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Stack gap={4}>
      <Text c="var(--mantine-color-text)" fz={64} fw={700} lh="0.9">
        {title}
      </Text>
      <Text color="dimmed" fz="h4">
        {subtitle}
      </Text>
    </Stack>
  );
}
