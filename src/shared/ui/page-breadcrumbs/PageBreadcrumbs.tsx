import { Anchor, Box, Breadcrumbs, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export function PageBreadcrumbs({
  parentLabel,
  parentPath,
  currentLabel,
}: {
  parentLabel: string;
  parentPath: string;
  currentLabel: string;
}) {
  return (
    <Box component="nav" aria-label="Хлебные крошки" style={{ minWidth: 0 }}>
      <Breadcrumbs
        separator={<IconChevronRight size={20} />}
        styles={{ root: { flexWrap: "wrap", rowGap: 4 } }}
      >
        <Anchor component={Link} to={parentPath} size="lg" fw={500}>
          {parentLabel}
        </Anchor>
        <Text
          size="lg"
          c="dimmed"
          aria-current="page"
          style={{ whiteSpace: "normal", overflowWrap: "anywhere" }}
        >
          {currentLabel}
        </Text>
      </Breadcrumbs>
    </Box>
  );
}
