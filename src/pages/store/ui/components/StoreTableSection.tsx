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
  useWriteOffStoreBatchMutation,
} from "@/entities/store";
import { StoreTableRow } from "./StoreTableRow";

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
  const [writeOffProduct, setWriteOffProduct] = useState<IStoreProduct | null>(
    null,
  );
  const [writeOffBatch, { isLoading: isSaving }] =
    useWriteOffStoreBatchMutation();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useNotifications("top-right");

  const confirmWriteOff = async () => {
    if (!writeOffProduct || isSaving || Date.parse(writeOffProduct.expiresAt) <= Date.now()) return;
    try {
      await writeOffBatch({ batchId: writeOffProduct.id }).unwrap();
      dispatch(
        storeApi.util.invalidateTags([
          { type: "Store", id: writeOffProduct.id },
        ]),
      );
      showSuccess("Продукт списан. Остаток на складе обнулён.");
      setWriteOffProduct(null);
    } catch (error) {
      showError(
        apiErrorMessage(
          error,
          "Не удалось списать продукт. Повторите попытку.",
        ),
      );
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
        <Center p="xl">
          <Loader />
        </Center>
      ) : (
        !isError && (
          <TableLayout
            columns={tableColumns}
            data={products}
            getRowKey={(product) => product.id}
            minWidth={1080}
            emptyText="Продукты не найдены"
            renderRow={(product) => (
              <StoreTableRow
                product={product}
                onWriteOff={setWriteOffProduct}
              />
            )}
          />
        )
      )}
      <ConfirmationModal
        opened={Boolean(writeOffProduct)}
        title={writeOffText.title}
        message={
          writeOffProduct
            ? "Вы точно хотите списать продукт «" +
              (writeOffProduct.product?.name ??
                "Продукт #" + writeOffProduct.productId) +
              "» с поставки " +
              writeOffProduct.supplyId +
              "?"
            : ""
        }
        warning={
          writeOffProduct && Date.parse(writeOffProduct.expiresAt) > Date.now()
            ? writeOffText.warning
            : undefined
        }
        confirmText={writeOffText.confirm}
        cancelText={writeOffText.cancel}
        onClose={() => {
          if (!isSaving) setWriteOffProduct(null);
        }}
        onConfirm={confirmWriteOff}
        loading={isSaving}
      />
    </>
  );
}
