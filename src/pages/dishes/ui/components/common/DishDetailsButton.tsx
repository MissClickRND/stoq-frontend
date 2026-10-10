import { Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export function DishDetailsButton({ id }: { id: string }) {
  const navigate = useNavigate();
  return (
    <Button
      size="sm"
      variant="default"
      onClick={() => navigate(`/dishes/${id}`)}
    >
      Подробнее
    </Button>
  );
}
