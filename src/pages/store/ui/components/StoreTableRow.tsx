import { normalizeArticle } from "@/shared/lib/format";
import {
  ActionIcon,
  Button,
  Group,
  Table,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { IconExternalLink, IconTrash } from "@tabler/icons-react";
import { type IStoreProduct, formatPrice, getStoreQuantity } from "@/entities/store";

import { StoreProductStatus } from "./StoreProductStatus";
import { StoreShelfLife } from "./StoreShelfLife";
import { Link, useNavigate } from "react-router-dom";

type StoreTableRowProps = {
  product: IStoreProduct;
  onWriteOff: (product: IStoreProduct) => void;
};

export function StoreTableRow({
  product,
  onWriteOff,
}: StoreTableRowProps) {
  const navigate = useNavigate();
  const handleNavigateToSupply = (supplyId: number) => {
    navigate(`/supply/${encodeURIComponent(supplyId)}`);
  };

  return (
    <Table.Tr>
      <Table.Td>
        <UnstyledButton
          onClick={() => handleNavigateToSupply(product.supplyId)}
        >
          <Group align="center" gap="2" wrap="nowrap">
            <Text size="lg" fw={600}>
              {normalizeArticle(product.supplyId)}
            </Text>
            <IconExternalLink size={20} />
          </Group>
        </UnstyledButton>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={600}>
          {(product.product?.name ?? "Продукт #" + product.productId)}
        </Text>
        <Text size="sm" c="dimmed">
          Арт. {normalizeArticle(product.productId)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {getStoreQuantity(product).toLocaleString("ru-RU", { maximumFractionDigits: 3 })}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={500}>
          {(product.product?.unit?.shortName ?? "шт.")}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {product.price == null ? "—" : formatPrice(String(product.price))}
        </Text>
      </Table.Td>
      <Table.Td>
        <StoreShelfLife shelfLife={product.expiresAt} status={product.status} />
      </Table.Td>
      <Table.Td>
        <StoreProductStatus status={product.status} />
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Button
            size="lg"
            variant="default"
            component={Link}
            to={`/store/${product.id}`}
            state={{ batch: product }}
          >
            Подробнее
          </Button>
          <Tooltip label="Списать продукт">
            <ActionIcon
              size={50}
              variant="light"
              color="red"
              disabled={getStoreQuantity(product) <= 0}
              aria-label={`Списать ${(product.product?.name ?? "Продукт #" + product.productId)}, артикул ${normalizeArticle(product.productId)}, поставка ${normalizeArticle(product.supplyId)}`}
              onClick={() => onWriteOff(product)}
            >
              <IconTrash />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
