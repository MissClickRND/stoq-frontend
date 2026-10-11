import { useState } from "react";
import TableLayout from "@/shared/ui/table-layout";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { tableColumns, writeOffText } from "../../model/table-data";
import {
  type StoreProduct,
  useStoreProducts,
  matchesStoreProduct,
} from "@/entities/stock";
import { StoreTableRow } from "./StoreTableRow";
import { StoreProductModal } from "./StoreProductModal";

export default function StoreTableSection({
  searchValue = "",
}: {
  searchValue?: string;
}) {
  const { products, removeProduct } = useStoreProducts();
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(
    null,
  );
  const [writeOffProduct, setWriteOffProduct] = useState<StoreProduct | null>(
    null,
  );
  const filteredProducts = products.filter((product) =>
    matchesStoreProduct(product, searchValue),
  );

  const confirmWriteOff = () => {
    if (!writeOffProduct) return;
    removeProduct(writeOffProduct.id);
    //! Закрыть подтверждение и обновить остатки после ответа сервера.
  };

  return (
    <>
      <TableLayout
        columns={tableColumns}
        data={filteredProducts}
        getRowKey={(product) => product.id}
        minWidth={1080}
        emptyText="Продукты не найдены"
        renderRow={(product) => (
          <StoreTableRow
            product={product}
            onDetails={setSelectedProduct}
            onWriteOff={setWriteOffProduct}
          />
        )}
      />
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
