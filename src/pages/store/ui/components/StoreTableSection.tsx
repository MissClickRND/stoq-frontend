import { useState } from "react";
import { Alert, Button, Center, Loader } from "@mantine/core";
import { useNotifications } from "@/shared/lib/hooks/useNotifications";
import { useAppDispatch } from "@/shared/lib/store";
import { apiErrorMessage } from "@/shared/lib/api-error";
import TableLayout from "@/shared/ui/table-layout";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { tableColumns, writeOffText } from "../../model/table-data";
import {
  type IStoreProduct,
  storeApi,
  useInventoryStoreMutation,
} from "@/entities/store";
import { StoreTableRow } from "./StoreTableRow";
import { StoreProductModal } from "./StoreProductModal";

type StoreTableSectionProps = {
  products: IStoreProduct[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export default function StoreTableSection({
  products,
  isLoading,
  isError,
  onRetry,
}: StoreTableSectionProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [writeOffProduct, setWriteOffProduct] = useState<IStoreProduct | null>(null);
  const [inventoryStore, { isLoading: isSaving }] = useInventoryStoreMutation();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useNotifications("top-right");

  const confirmWriteOff = async () => {
    if (!writeOffProduct || isSaving) return;
    try {
      await inventoryStore({
        items: [{ batchId: writeOffProduct.id, quantity: 0 }],
      }).unwrap();
      dispatch(
        storeApi.util.invalidateTags([{ type: "Store", id: writeOffProduct.id }]),
      );
      showSuccess("Продукт списан. Остаток на складе обнулён.");
      setWriteOffProduct(null);
    } catch (error) {
      showError(apiErrorMessage(error, "Не удалось списать продукт. Повторите попытку."));
    }
  };

  return (
    <>
      {isError && (
        <Alert color="red" title="Не удалось загрузить склад">
          <Button variant="subtle" onClick={onRetry}>
            Повторить
          </Button>
        </Alert>
      )}
      {isLoading ? (
        <Center p="xl"><Loader /></Center>
      ) : !isError && (
        <TableLayout
          columns={tableColumns}
          data={products}
          getRowKey={(product) => product.id}
          minWidth={1080}
          emptyText="Продукты не найдены"
          renderRow={(product) => (
            <StoreTableRow
              product={product}
              onDetails={(item) => setSelectedProductId(item.id)}
              onWriteOff={setWriteOffProduct}
            />
          )}
        />
      )}
      <StoreProductModal
        productId={selectedProductId}
        fallbackProduct={products.find((product) => product.id === selectedProductId)}
        onClose={() => setSelectedProductId(null)}
        onWriteOff={(product) => {
          setSelectedProductId(null);
          setWriteOffProduct(product);
        }}
      />
      <ConfirmationModal
        opened={Boolean(writeOffProduct)}
        title={writeOffText.title}
        message={
          writeOffProduct
            ? "Вы точно хотите списать продукт «" + (writeOffProduct.product?.name ?? "Продукт #" + writeOffProduct.productId) +
              "» с поставки " + writeOffProduct.supplyId + "?"
            : ""
        }
        warning={
          writeOffProduct && writeOffProduct.status !== "EXPIRED"
            ? writeOffText.warning
            : undefined
        }
        confirmText={writeOffText.confirm}
        cancelText={writeOffText.cancel}
        onClose={() => { if (!isSaving) setWriteOffProduct(null); }}
        onConfirm={confirmWriteOff}
        loading={isSaving}
      />
    </>
  );
}
