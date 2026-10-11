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
import { type StoreProduct, formatPrice } from "@/entities/stock";

import { StoreProductStatus } from "./StoreProductStatus";
import { StoreShelfLife } from "./StoreShelfLife";
import { useNavigate } from "react-router-dom";

type StoreTableRowProps = {
  product: StoreProduct;
  onDetails: (product: StoreProduct) => void;
  onWriteOff: (product: StoreProduct) => void;
};

export function StoreTableRow({
  product,
  onDetails,
  onWriteOff,
}: StoreTableRowProps) {
  const navigate = useNavigate();
  const handleNavigateToSupply = (supplyId: string) => {
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
              {product.supplyId}
            </Text>
            <IconExternalLink size={20} />
          </Group>
        </UnstyledButton>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={600}>
          {product.title}
        </Text>
        <Text size="sm" c="dimmed">
          Арт. {product.article}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {product.remains}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={500}>
          {product.units}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="lg" fw={700}>
          {formatPrice(product.totalPrice)}
        </Text>
      </Table.Td>
      <Table.Td>
        <StoreShelfLife shelfLife={product.shelfLife} />
      </Table.Td>
      <Table.Td>
        <StoreProductStatus status={product.status} />
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Button
            size="lg"
            variant="default"
            onClick={() => onDetails(product)}
          >
            Подробнее
          </Button>
          <Tooltip label="Списать продукт">
            <ActionIcon
              size="lg"
              variant="light"
              color="red"
              aria-label={`Списать ${product.title}, артикул ${product.article}, поставка ${product.supplyId}`}
              onClick={() => onWriteOff(product)}
            >
              <IconTrash size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
