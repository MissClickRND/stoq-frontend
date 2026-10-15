import {
  Alert,
  Anchor,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { WriteOffStockButton } from "@/features/write-off-stock";
import {
  formatPrice,
  getProductBatches,
  getStoreQuantity,
  getTotalStoreQuantity,
  useGetStoreQuery,
  type IStoreProduct,
} from "@/entities/store";
import { normalizeArticle } from "@/shared/lib/format";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import TableLayout from "@/shared/ui/table-layout";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { StoreProductStatus } from "../components/StoreProductStatus";
import { StoreShelfLife } from "../components/StoreShelfLife";
import classes from "./StoreProductPage.module.css";

const quantityFormat = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 3,
});

export function StoreProductRoute() {
  const { batchId } = useParams();
  const location = useLocation();
  const id = Number(batchId);
  const validId =
    /^\d+$/.test(batchId ?? "") && Number.isSafeInteger(id) && id > 0;
  const listing = useGetStoreQuery(
    { search: "" },
    { skip: !validId, refetchOnMountOrArgChange: true },
  );
  const passedBatch = (location.state as { batch?: IStoreProduct } | null)
    ?.batch;
  const batch = validId
    ? (listing.currentData?.find((item) => item.id === id) ??
      (passedBatch?.id === id ? passedBatch : undefined))
    : undefined;

  return (
    <StoreProductPage
      batch={batch}
      products={listing.currentData}
      isLoading={validId && listing.isFetching && !listing.currentData}
      isError={listing.isError}
      onRetry={() => listing.refetch()}
    />
  );
}

type StoreProductPageProps = {
  batch?: IStoreProduct;
  products?: IStoreProduct[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function StoreProductPage({
  batch,
  products,
  isLoading,
  isError,
  onRetry,
}: StoreProductPageProps) {
  const navigate = useNavigate();
  const batches = batch ? getProductBatches(products ?? [], batch) : [];
  const otherBatches = batches.filter((item) => item.id !== batch?.id);
  const unit = batch?.product?.unit?.shortName ?? "шт.";
  const notFound = !batch && !isLoading && !isError;
  const name = batch?.product?.name ?? "Продукт на складе";

  return (
    <DefaultPageLayout
      title={notFound ? "Запись не найдена" : name}
      subtitle={
        notFound
          ? "Проверьте адрес или вернитесь к списку склада"
          : batch
            ? `Информация о складской партии № ${normalizeArticle(batch.id)}`
            : "Получаем информацию о продукте"
      }
      disableSearch
      disableStatistics
      headerTopSection={
        <PageBreadcrumbs
          parentLabel="Склад"
          parentPath="/store"
          currentLabel={batch ? name : "Информация о продукте"}
        />
      }
      headerRightSection={
        batch ? (
          <Group gap="sm">
            <StoreProductStatus status={batch.status} />
            <WriteOffStockButton
              batch={batch}
              onSuccess={() => navigate("/store")}
            />
          </Group>
        ) : undefined
      }
    >
      <Stack className={classes.content} gap="lg">
        {isLoading && !batch && (
          <Center p="xl">
            <Loader aria-label="Загрузка продукта" />
          </Center>
        )}
        {isError && !batch && (
          <Alert color="red" title="Не удалось загрузить продукт">
            <Button variant="subtle" onClick={onRetry}>
              Повторить
            </Button>
          </Alert>
        )}
        {notFound && (
          <Button
            component={Link}
            to="/store"
            variant="default"
            style={{ alignSelf: "flex-start" }}
          >
            Вернуться на склад
          </Button>
        )}
        {batch && (
          <>
            <Paper withBorder p="lg">
              <Title order={2} size="lg" mb="lg">
                Информация о партии
              </Title>
              <SimpleGrid cols={{ base: 1, xs: 2, lg: 3 }} spacing="lg">
                <Box>
                  <Text size="sm" c="dimmed">
                    Артикул продукта
                  </Text>
                  <Text fw={600}>{normalizeArticle(batch.productId)}</Text>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed">
                    Поставка
                  </Text>
                  <Anchor component={Link} to={`/supply/${batch.supplyId}`}>
                    № {normalizeArticle(batch.supplyId)}
                  </Anchor>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed">
                    Остаток в партии
                  </Text>
                  <Text fw={700} size="lg">
                    {quantityFormat.format(getStoreQuantity(batch))} {unit}
                  </Text>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed" mb={4}>
                    Срок годности
                  </Text>
                  <StoreShelfLife
                    shelfLife={batch.expiresAt}
                  />
                </Box>
                <Box>
                  <Text size="sm" c="dimmed">
                    Цена за единицу ({unit})
                  </Text>
                  <Text fw={600}>
                    {batch.price == null
                      ? "—"
                      : formatPrice(String(batch.price))}
                  </Text>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed">
                    Итоговая стоимость партии
                  </Text>
                  <Text fw={600}>
                    {batch.totalPrice == null
                      ? "—"
                      : formatPrice(String(batch.totalPrice))}
                  </Text>
                </Box>
              </SimpleGrid>
            </Paper>
            <Paper withBorder p="lg">
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Title order={2} size="lg">
                    Всего продукта на складе
                  </Title>
                  <Text size="sm" c="dimmed" mt={4}>
                    Сумма доступных остатков во всех партиях продукта
                  </Text>
                </Box>
                {isLoading ? (
                  <Loader size="sm" aria-label="Загрузка общего остатка" />
                ) : (
                  <Text size="xl" fw={700} c="primary">
                    {isError || !products
                      ? "—"
                      : `${quantityFormat.format(getTotalStoreQuantity(batches))} ${unit}`}
                  </Text>
                )}
              </Group>
            </Paper>
            <Box component="section" aria-labelledby="other-batches-title">
              <Title order={2} size="lg" mb="md" id="other-batches-title">
                Другие партии этого продукта
              </Title>
              {isError ? (
                <Alert
                  color="red"
                  title="Не удалось загрузить партии и общий остаток"
                >
                  <Button variant="subtle" onClick={onRetry}>
                    Повторить
                  </Button>
                </Alert>
              ) : isLoading ? (
                <Center p="xl">
                  <Loader />
                </Center>
              ) : (
                <TableLayout
                  autoHeight
                  columns={[
                    "Партия",
                    "Поставка",
                    "Остаток",
                    "Срок годности",
                    "Статус",
                    "",
                  ]}
                  minWidth={760}
                  data={otherBatches}
                  getRowKey={(item) => item.id}
                  emptyText="Других партий этого продукта на складе нет"
                  renderRow={(item) => (
                    <Table.Tr>
                      <Table.Td>
                        <Text fw={600}>№ {normalizeArticle(item.id)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Anchor
                          component={Link}
                          to={`/supply/${item.supplyId}`}
                        >
                          № {normalizeArticle(item.supplyId)}
                        </Anchor>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600} style={{ whiteSpace: "nowrap" }}>
                          {quantityFormat.format(getStoreQuantity(item))} {unit}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <StoreShelfLife
                          shelfLife={item.expiresAt}
                        />
                      </Table.Td>
                      <Table.Td>
                        <StoreProductStatus status={item.status} />
                      </Table.Td>
                      <Table.Td>
                        <Button
                          component={Link}
                          to={`/store/${item.id}`}
                          state={{ batch: item }}
                          variant="default"
                          size="sm"
                        >
                          Подробнее
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  )}
                />
              )}
            </Box>
          </>
        )}
      </Stack>
    </DefaultPageLayout>
  );
}
