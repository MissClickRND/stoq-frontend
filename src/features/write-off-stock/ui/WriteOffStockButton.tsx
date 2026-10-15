import { Button } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import {
  type IStoreProduct,
  getStoreQuantity,
  useWriteOffStoreBatchMutation,
} from "@/entities/store";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { useNotifications } from "@/shared/lib/hooks/useNotifications";
import { apiErrorMessage } from "@/shared/lib/api-error";

export function WriteOffStockButton({
  batch,
  onSuccess,
}: {
  batch: IStoreProduct;
  onSuccess: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const [writeOff, { isLoading }] = useWriteOffStoreBatchMutation();
  const { showSuccess, showError } = useNotifications("top-right");
  return (
    <>
      <Button
        color="red"
        variant="light"
        disabled={getStoreQuantity(batch) <= 0}
        leftSection={<IconTrash size={18} />}
        onClick={() => setOpened(true)}
      >
        Списать продукт
      </Button>
      <ConfirmationModal
        opened={opened}
        title="Списание продукта"
        message={`Списать весь доступный остаток продукта «${batch.product?.name ?? batch.productId}» из партии № ${batch.id}?`}
        warning="Остаток будет обнулён. Списание сохранится в истории движения склада."
        confirmText="Списать"
        cancelText="Отмена"
        loading={isLoading}
        onClose={() => {
          if (!isLoading) setOpened(false);
        }}
        onConfirm={async () => {
          if (isLoading) return;
          try {
            await writeOff({ batchId: batch.id }).unwrap();
            setOpened(false);
            showSuccess("Продукт списан");
            onSuccess();
          } catch (error) {
            showError(apiErrorMessage(error, "Не удалось списать продукт"));
          }
        }}
      />
    </>
  );
}
