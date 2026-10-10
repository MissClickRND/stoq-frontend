import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useEffect } from "react";

export function CopyInvitationButton({
  url,
  disabled,
  compact = false,
}: {
  url: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const clipboard = useClipboard({ timeout: 2000 });
  useEffect(() => {
    if (clipboard.error)
      notifications.show({
        color: "red",
        message:
          "Не удалось скопировать ссылку. Выделите и скопируйте её вручную.",
      });
  }, [clipboard.error]);
  const icon = clipboard.copied ? (
    <IconCheck size={17} />
  ) : (
    <IconCopy size={17} />
  );
  return compact ? (
    <Tooltip label={clipboard.copied ? "Скопировано" : "Скопировать ссылку"}>
      <ActionIcon
        aria-label="Скопировать ссылку"
        variant="default"
        size="lg"
        disabled={disabled}
        onClick={() => clipboard.copy(url)}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  ) : (
    <Button
      variant="default"
      disabled={disabled}
      leftSection={icon}
      onClick={() => clipboard.copy(url)}
    >
      {clipboard.copied ? "Скопировано" : "Скопировать"}
    </Button>
  );
}
