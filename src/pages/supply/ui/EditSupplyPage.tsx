import { Alert, Button, Center, Loader, Stack, Text } from "@mantine/core";
import { skipToken } from "@reduxjs/toolkit/query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useGetSupplyByIdQuery } from "@/entities/supply";
import { CreateSupplyPage } from "./CreateSupplyPage/CreateSupplyPage";

export function EditSupplyPage() {
  const { supplyId } = useParams();
  const [params] = useSearchParams();
  const id = Number(supplyId);
  const valid =
    /^\d+$/.test(supplyId ?? "") && Number.isSafeInteger(id) && id > 0;
  const {
    currentData: supply,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSupplyByIdQuery(valid ? { id } : skipToken, {
    refetchOnMountOrArgChange: true,
  });
  if (isFetching && !supply)
    return (
      <Center p="xl">
        <Loader />
      </Center>
    );
  if (isError && !(error && "status" in error && error.status === 404))
    return (
      <Alert m="lg" color="red" title="Не удалось загрузить поставку">
        <Button variant="subtle" onClick={() => refetch()}>
          Повторить
        </Button>
      </Alert>
    );
  if (!supply)
    return (
      <Stack p="lg">
        <Text>Поставка не найдена</Text>
        <Button component={Link} to="/supply">
          К поставкам
        </Button>
      </Stack>
    );
  return (
    <CreateSupplyPage
      key={`${supply.id}-${params.get("accept")}`}
      initialSupply={supply}
      accepting={params.get("accept") === "1" && supply.status === "IN_TRANSIT"}
    />
  );
}
