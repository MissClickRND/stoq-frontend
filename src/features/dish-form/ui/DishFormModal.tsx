import { Modal } from "@mantine/core";
import type { Dish } from "@/entities/dish";
import type { ReactNode } from "react";
import { DishForm, type IngredientSearchProps } from "./DishForm";

export function DishFormModal({
  opened,
  onClose,
  dish,
  renderIngredientSearch,
}: {
  opened: boolean;
  onClose: () => void;
  dish?: Dish;
  renderIngredientSearch: (props: IngredientSearchProps) => ReactNode;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={dish ? "Редактирование блюда" : "Добавление блюда"}
      centered
      size="lg"
    >
      {opened && (
        <DishForm
          dish={dish}
          onClose={onClose}
          renderIngredientSearch={renderIngredientSearch}
        />
      )}
    </Modal>
  );
}
