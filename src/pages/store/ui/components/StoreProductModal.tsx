import { normalizeArticle } from "@/shared/lib/format";
import {
  Alert,
  Center,
  Loader,
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
import { skipToken } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import {
  type IStoreProduct,
  formatPrice,
  useGetStoreProductByIdQuery,
} from "@/entities/store";

import { StoreShelfLife } from "./StoreShelfLife";
import { StoreProductStatus } from "./StoreProductStatus";
import { IconExternalLink } from "@tabler/icons-react";

type StoreProductModalProps = {
  productId: number | null;
  fallbackProduct?: IStoreProduct | null;
  onClose: () => void;
  onWriteOff: (product: IStoreProduct) => void;
};

export function StoreProductModal({
  productId,
  fallbackProduct,
  onClose,
  onWriteOff,
}: StoreProductModalProps) {
  const navigate = useNavigate();
  const { currentData, isFetching, isError, refetch } =
    useGetStoreProductByIdQuery(
      productId === null ? skipToken : { id: productId },
      { refetchOnMountOrArgChange: true },
    );
  const product = currentData ?? null;
  const catalogProduct = product?.product ?? fallbackProduct?.product;
  const name =
    catalogProduct?.name ??
    fallbackProduct?.product?.name ??
    "Продукт #" + (product?.productId ?? fallbackProduct?.productId);
  const unit =
    catalogProduct?.unit?.shortName ??
    fallbackProduct?.product?.unit?.shortName ??
    "шт.";
  const Quantity = product?.Quantity ?? fallbackProduct?.Quantity ?? 0;

  const handleNavigateToSupply = (supplyId: number) => {
    onClose();
    navigate(`/supply/${encodeURIComponent(supplyId)}`);
  };
  return (
    <Modal
      opened={productId !== null}
      onClose={onClose}
      title="Информация о продукте"
      centered
      size="lg"
    >
      {isFetching && !product && (
        <Center p="xl">
          <Loader />
        </Center>
      )}
      {isError && (
        <Alert color="red" title="Не удалось загрузить запись склада">
          <Button variant="subtle" onClick={() => refetch()}>
            Повторить
          </Button>
        </Alert>
      )}
      {product && !isError && (
        <Stack gap="lg">
          <Box>
            <Text size="xl" fw={700}>
              {name}
            </Text>
            <StoreProductStatus status={product.status} />
          </Box>
          <Divider />
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="lg">
            <Box>
              <Text size="xs" c="dimmed">
                Артикул
              </Text>
              <Text fw={600}>{normalizeArticle(product.productId)}</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                ID поставки
              </Text>
              <UnstyledButton
                onClick={() => handleNavigateToSupply(product.supplyId)}
              >
                <Group align="center" gap="2" wrap="nowrap">
                  <Text fw={600}>{normalizeArticle(product.supplyId)}</Text>
                  <IconExternalLink size={16} />
                </Group>
              </UnstyledButton>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Срок годности
              </Text>
              <StoreShelfLife
                shelfLife={
                  product.expiresAt ?? fallbackProduct?.expiresAt ?? "—"
                }
                status={product.status}
              />
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Остаток
              </Text>
              <Text fw={600}>
                {Quantity} {unit}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Цена за единицу ({unit})
              </Text>
              <Text fw={600}>{formatPrice("0")}</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Итоговая цена
              </Text>
              <Text fw={600}>{formatPrice("0")}</Text>
            </Box>
          </SimpleGrid>
          <Group justify="end">
            <Button
              color="red"
              variant="light"
              onClick={() =>
                onWriteOff({
                  ...product,
                  product: catalogProduct ?? product.product,
                })
              }
            >
              Списать продукт
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
