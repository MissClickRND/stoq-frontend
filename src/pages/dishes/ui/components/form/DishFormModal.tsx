import { Modal } from "@mantine/core";
import type { Dish } from "../../../model/type";
import { DishForm } from "./DishForm";

export function DishFormModal({
  opened,
  onClose,
  dish,
}: {
  opened: boolean;
  onClose: () => void;
  dish?: Dish;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={dish ? "Редактирование блюда" : "Добавление блюда"}
      centered
      size="lg"
    >
      {opened && <DishForm dish={dish} onClose={onClose} />}
    </Modal>
  );
}
