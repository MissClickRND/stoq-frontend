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
import type { StoreProduct } from "../../model/type";
import { formatPrice } from "../../model/format";
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
    navigate(`/store/supplies/${supplyId}`);
  };

  return (
    <Table.Tr>
      <Table.Td>
        <UnstyledButton
          onClick={() => handleNavigateToSupply(product.supplyId)}
        >
          <Group align="center" gap="2" wrap="nowrap">
            <Text size="sm" fw={600}>
              {product.supplyId}
            </Text>
            <IconExternalLink size={15} />
          </Group>
        </UnstyledButton>
      </Table.Td>
      <Table.Td>
        <Text size="md" fw={600}>
          {product.title}
        </Text>
        <Text size="xs" c="dimmed">
          Арт. {product.article}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fw={600}>{product.remains}</Text>
      </Table.Td>
      <Table.Td>
        <Text fw={500}>{product.units}</Text>
      </Table.Td>
      <Table.Td>
        <Text fw={600}>{formatPrice(product.totalPrice)}</Text>
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
            size="sm"
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
              <IconTrash size={17} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
