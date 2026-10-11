import { useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useNotifications } from "@/shared/lib/hooks/useNotifications";

export function DownloadButton({
  onDownload,
  children,
  variant,
}: {
  onDownload: () => Promise<void>;
  children: ReactNode;
  variant?: ButtonProps["variant"];
}) {
  const [loading, setLoading] = useState(false);
  const { showError } = useNotifications();
  const download = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onDownload();
    } catch {
      showError("Не удалось скачать отчёт. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      size="lg"
      variant={variant}
      loading={loading}
      onClick={download}
      leftSection={<IconDownload size={20} />}
    >
      {children}
    </Button>
  );
}
