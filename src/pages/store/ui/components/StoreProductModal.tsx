import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { StoreProduct } from "../../model/type";
import { formatPrice } from "../../model/format";
import { StoreProductStatus } from "./StoreProductStatus";
import { IconExternalLink } from "@tabler/icons-react";

type StoreProductModalProps = {
  product: StoreProduct | null;
  onClose: () => void;
  onWriteOff: (product: StoreProduct) => void;
};

export function StoreProductModal({
  product,
  onClose,
  onWriteOff,
}: StoreProductModalProps) {
  const navigate = useNavigate();

  const handleNavigateToSupply = (supplyId: string) => {
    onClose();
    navigate(`/store/supplies/${supplyId}`);
  };
  return (
    <Modal
      opened={Boolean(product)}
      onClose={onClose}
      title="Информация о продукте"
      centered
      size="lg"
    >
      {product && (
        <Stack gap="lg">
          <Box>
            <Text size="xl" fw={700}>
              {product.title}
            </Text>
            <StoreProductStatus status={product.status} />
          </Box>
          <Divider />
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="lg">
            <Box>
              <Text size="xs" c="dimmed">
                Артикул
              </Text>
              <Text fw={600}>{product.article}</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                ID поставки
              </Text>
              <UnstyledButton
                onClick={() => handleNavigateToSupply(product.supplyId)}
              >
                <Group align="center" gap="2" wrap="nowrap">
                  <Text fw={600}>{product.supplyId}</Text>
                  <IconExternalLink size={16} />
                </Group>
              </UnstyledButton>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Срок годности
              </Text>
              <Text fw={600}>{product.shelfLife}</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Остаток
              </Text>
              <Text fw={600}>
                {product.remains} {product.units}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Цена за единицу ({product.units})
              </Text>
              <Text fw={600}>{formatPrice(product.price)}</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Итоговая цена
              </Text>
              <Text fw={600}>{formatPrice(product.totalPrice)}</Text>
            </Box>
          </SimpleGrid>
          <Group justify="end">
            <Button
              color="red"
              variant="light"
              onClick={() => onWriteOff(product)}
            >
              Списать продукт
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
