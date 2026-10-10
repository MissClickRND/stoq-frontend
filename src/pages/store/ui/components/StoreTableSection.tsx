import { Paper, ScrollArea, Table, Text } from "@mantine/core";
import { useState } from "react";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import {
  initialStoreProducts,
  tableColumns,
  writeOffText,
} from "../../model/table-data";
import type { StoreProduct } from "../../model/type";
import { StoreTableRow } from "./StoreTableRow";
import { StoreProductModal } from "./StoreProductModal";
import classes from "./StoreTableSection.module.css";

export default function StoreTableSection({
  searchValue = "",
}: {
  searchValue?: string;
}) {
  const [products, setProducts] =
    useState<StoreProduct[]>(initialStoreProducts);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(
    null,
  );
  const [writeOffProduct, setWriteOffProduct] = useState<StoreProduct | null>(
    null,
  );
  const query = searchValue.trim().toLocaleLowerCase("ru-RU");
  const filteredProducts = products.filter((product) =>
    `${product.title} ${product.article} ${product.supplyId}`
      .toLocaleLowerCase("ru-RU")
      .includes(query),
  );

  const confirmWriteOff = () => {
    if (!writeOffProduct) return;
    setProducts((current) =>
      current.filter((product) => product.id !== writeOffProduct.id),
    );
    setSelectedProduct((current) =>
      current?.id === writeOffProduct.id ? null : current,
    );
    setWriteOffProduct(null);
  };

  return (
    <>
      <Paper className={classes.section} withBorder radius="lg">
        <ScrollArea h="100%" type="auto" offsetScrollbars>
          <Table
            horizontalSpacing="xl"
            stickyHeader
            stickyHeaderOffset={0}
            highlightOnHover
            verticalSpacing="md"
            className={classes.table}
          >
            <Table.Thead className={classes.header}>
              <Table.Tr>
                {tableColumns.map((title) => (
                  <Table.Th key={title}>{title}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredProducts.map((product) => (
                <StoreTableRow
                  key={product.id}
                  product={product}
                  onDetails={setSelectedProduct}
                  onWriteOff={setWriteOffProduct}
                />
              ))}
              {filteredProducts.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={tableColumns.length}>
                    <Text ta="center" c="dimmed" py="xl">
                      Продукты не найдены
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
      <StoreProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onWriteOff={(product) => {
          setSelectedProduct(null);
          setWriteOffProduct(product);
        }}
      />
      <ConfirmationModal
        opened={Boolean(writeOffProduct)}
        title={writeOffText.title}
        message={
          writeOffProduct
            ? `Вы точно хотите списать продукт «${writeOffProduct.title}» артикула ${writeOffProduct.article} с поставки ${writeOffProduct.supplyId}?`
            : ""
        }
        warning={
          writeOffProduct && writeOffProduct.status !== "expired"
            ? writeOffText.warning
            : undefined
        }
        confirmText={writeOffText.confirm}
        cancelText={writeOffText.cancel}
        onClose={() => setWriteOffProduct(null)}
        onConfirm={confirmWriteOff}
      />
    </>
  );
}
