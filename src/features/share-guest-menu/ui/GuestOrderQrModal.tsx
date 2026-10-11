import { useState } from "react";
import {
  Accordion,
  Alert,
  Button,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  QRCode,
  useQRCodeDownload,
  type QRCodeDotStyle,
} from "@gfazioli/mantine-qr-code";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconInfoCircle,
  IconSettings,
} from "@tabler/icons-react";
import { useNotifications } from "@/shared/lib/hooks/useNotifications";
import { guestMenuUrl } from "@/entities/order";

export function GuestOrderQrModal({
  opened,
  onClose,
  restaurantId,
}: {
  opened: boolean;
  onClose: () => void;
  restaurantId: string;
}) {
  const [dotStyle, setDotStyle] = useState<QRCodeDotStyle>("square");
  const [color, setColor] = useState("#002a2d");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { showError } = useNotifications();
  const url = guestMenuUrl(window.location.origin, restaurantId);
  const { ref, download } = useQRCodeDownload({
    fileName: `STOQ-menu-${restaurantId}`,
    scale: 12,
  });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      showError(
        "Не удалось скопировать ссылку. Выделите её и скопируйте вручную.",
      );
    }
  };
  const saveQr = async () => {
    setDownloading(true);
    try {
      await download({ format: "png" });
    } catch {
      showError("Не удалось скачать QR. Попробуйте ещё раз.");
    } finally {
      setDownloading(false);
    }
  };
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={700}>
          Гостевой заказ по QR
        </Text>
      }
      centered
      size="lg"
    >
      <Stack gap="lg">
        <Text c="dimmed">
          Гости смогут открыть меню и собрать заказ самостоятельно.
        </Text>
        <Stack align="center" gap="xs">
          <QRCode
            ref={ref}
            value={url}
            size={260}
            color={color}
            background="#ffffff"
            quietZone={4}
            dotStyle={dotStyle}
            cornerStyle={dotStyle}
            errorCorrectionLevel="H"
            aria-label="QR-код гостевого меню"
          />
          <Text size="sm" c="dimmed">
            Сканируйте QR, чтобы открыть меню
          </Text>
        </Stack>
        <TextInput
          size="lg"
          label="Ссылка на гостевой заказ"
          value={url}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Button
            size="lg"
            leftSection={
              copied ? <IconCheck size={20} /> : <IconCopy size={20} />
            }
            onClick={copy}
          >
            {copied ? "Скопировано" : "Скопировать ссылку"}
          </Button>
          <Button
            size="lg"
            variant="default"
            leftSection={<IconDownload size={20} />}
            loading={downloading}
            onClick={saveQr}
          >
            Скачать QR
          </Button>
        </SimpleGrid>
        <Accordion variant="separated">
          <Accordion.Item value="appearance">
            <Accordion.Control icon={<IconSettings size={20} />}>
              Настроить QR
            </Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid cols={2}>
                <Select
                  label="Форма элементов"
                  value={dotStyle}
                  allowDeselect={false}
                  data={[
                    { value: "square", label: "Квадратная" },
                    { value: "rounded", label: "Скруглённая" },
                    { value: "dots", label: "Точки" },
                  ]}
                  onChange={(value) =>
                    value && setDotStyle(value as QRCodeDotStyle)
                  }
                />
                <Select
                  label="Цвет QR"
                  value={color}
                  allowDeselect={false}
                  data={[
                    { value: "#002a2d", label: "Фирменный" },
                    { value: "#000000", label: "Чёрный" },
                    { value: "#165c26", label: "Зелёный" },
                  ]}
                  onChange={(value) => value && setColor(value)}
                />
              </SimpleGrid>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <Alert icon={<IconInfoCircle size={20} />} color="blue">
          Поделитесь ссылкой или QR, чтобы гости могли сами создавать заказ.
        </Alert>
      </Stack>
    </Modal>
  );
}
