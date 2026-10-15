import { useGetUnitsQuery, type IUnit } from "@/entities/unit";
import { Alert, Button } from "@mantine/core";
import componentClasses from "./CreateSupplyPage.module.css";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useNotifications } from "@/shared/lib";
import { apiErrorMessage } from "@/shared/lib/api-error";
import dayjs from "dayjs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import {
  useCreateSupplyMutation,
  useUpdateSupplyMutation,
  useScanSupplyUpdMutation,
  toUpdSupplyDrafts,
  suppliesApi,
  toCreateSupplyRequest,
  validateItem,
  calculateItemPrices,
  type SupplyItemDraft,
  type Product,
  type ISupply,
  type ISupplyStatus,
} from "@/entities/supply";

import { CreateProductModal } from "@/widgets/create-product-modal";
import { CreateUnitModal } from "../components/CreateUnitModal";
import { SupplyDeliveryFields } from "../components/SupplyDeliveryFields";
import { SupplySummary } from "../components/SupplySummary/SupplySummary";
import { SupplyProductsSection } from "../components/SupplyProductsSection/SupplyProductsSection";
import { ScanUpdModal } from "../components/ScanUpdModal";

export function CreateSupplyPage({
  initialSupply,
  accepting = false,
}: {
  initialSupply?: ISupply;
  accepting?: boolean;
}) {
  const [createSupply, { isLoading: creating }] = useCreateSupplyMutation();
  const [updateSupply, { isLoading: updating }] = useUpdateSupplyMutation();
  const saving = creating || updating;
  const [status, setStatus] = useState<ISupplyStatus>(
    accepting ? "RECEIVED" : (initialSupply?.status ?? "RECEIVED"),
  );
  const [scanSupplyUpd, { isLoading: scanning }] = useScanSupplyUpdMutation();
  const [scanOpened, setScanOpened] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useNotifications("top-right");
  const {
    data: units = [],
    isError: unitsError,
    refetch: refetchUnits,
  } = useGetUnitsQuery();
  const [receivedAt, setReceivedAt] = useState<string | null>(() =>
    dayjs(accepting ? undefined : initialSupply?.receivedAt).format("YYYY-MM-DD HH:mm:ss"),
  );
  const [supplyNumber, setSupplyNumber] = useState(
    initialSupply?.supplyNumber ?? "",
  );
  const [supplier, setSupplier] = useState(initialSupply?.supplier ?? "");
  const [items, setItems] = useState<SupplyItemDraft[]>(
    () =>
      initialSupply?.items.map((item) => ({
        id: String(item.id),
        product: {
          ...item.product,
          unitId: item.product.unitId ?? item.product.unit?.id,
        },
        quantity: item.quantity,
        unitId: item.product.unitId ?? item.product.unit?.id,
        expiresAt: dayjs(item.expiresAt).format("YYYY-MM-DD HH:mm:ss"),
        price: item.totalPrice ?? 0,
        pricingMode: "total",
      })) ?? [],
  );
  const [unitFor, setUnitFor] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const total =
    Math.round(
      items.reduce((sum, item) => sum + calculateItemPrices(item).total, 0) *
        100,
    ) / 100;
  const updateItem = (id: string, patch: Partial<SupplyItemDraft>) =>
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );

  const addProduct = (product: Product) => {
    const id = crypto.randomUUID();
    setItems((current) => [
      {
        id,
        product,
        quantity: "",
        unitId: product.unitId,
        expiresAt: null,
        price: 0,
        pricingMode: "unit",
      },
      ...current,
    ]);
    setFormError(null);
    requestAnimationFrame(() =>
      document
        .getElementById("supply-item-" + id)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || scanning) return;
    setSubmitted(true);
    setFormError(null);
    if (!receivedAt || !supplyNumber.trim() || !supplier.trim())
      return setFormError(
        "Заполните номер поставки, поставщика и дату поступления.",
      );
    if (!items.length)
      return setFormError("Добавьте хотя бы один продукт в поставку.");
    const unknownUnit = items.find(
      (item) =>
        item.unitId !== item.product.unitId &&
        !units.some((unit) => unit.id === item.unitId),
    );
    if (unknownUnit)
      return setFormError(
        "Выберите доступную единицу измерения для «" +
          unknownUnit.product.name +
          "».",
      );
    const invalid = items.find(
      (item) => Object.keys(validateItem(item, receivedAt)).length > 0,
    );
    if (invalid) {
      setFormError("Проверьте поля продукта «" + invalid.product.name + "».");
      document
        .getElementById("supply-item-" + invalid.id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    try {
      const request = toCreateSupplyRequest({
        supplyNumber,
        supplier,
        receivedAt,
        items,
        status,
      });
      const supply = initialSupply
        ? await updateSupply({ id: initialSupply.id, data: request }).unwrap()
        : await createSupply(request).unwrap();
      dispatch(
        suppliesApi.util.invalidateTags([{ type: "Store", id: "LIST" }]),
      );
      showSuccess(initialSupply ? "Поставка сохранена." : "Поставка создана.");
      navigate("/supply/" + supply.id);
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : apiErrorMessage(
              error,
              initialSupply ? "Не удалось сохранить поставку. Повторите попытку." : "Не удалось создать поставку. Повторите попытку.",
            ),
      );
    }
  };

  return (
    <>
      <DefaultPageLayout
        title={
          initialSupply
            ? accepting
              ? "Приёмка поставки"
              : "Редактирование поставки"
            : "Создание поставки"
        }
        subtitle="Добавьте продукты, укажите количество и сроки годности"
        disableSearch
        disableStatistics
        headerTopSection={
          <PageBreadcrumbs
            parentLabel="Поставки"
            parentPath="/supply"
            currentLabel={
              initialSupply
                ? `Поставка ${initialSupply.supplyNumber}`
                : "Создание поставки"
            }
          />
        }
      >
        <form onSubmit={submit} className={componentClasses.form} noValidate>
          <fieldset
            disabled={saving || scanning}
            style={{ display: "contents" }}
          >
            <div className={componentClasses.topSections}>
              <SupplyDeliveryFields
                receivedAt={receivedAt}
                supplyNumber={supplyNumber}
                supplier={supplier}
                onSupplierChange={setSupplier}
                status={status}
                onStatusChange={setStatus}
                submitted={submitted}
                onDateChange={setReceivedAt}
                onSupplyNumberChange={setSupplyNumber}
              />
              <SupplySummary
                count={items.length}
                saving={saving}
                total={total}
                error={formError}
                onClearError={() => setFormError(null)}
                submitLabel={
                  initialSupply
                    ? accepting
                      ? "Принять поставку"
                      : "Сохранить изменения"
                    : "Создать поставку"
                }
              />
            </div>
            {unitsError && (
              <Alert color="red" role="alert">
                Не удалось загрузить единицы измерения.
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => refetchUnits()}
                >
                  Повторить
                </Button>
              </Alert>
            )}
            <SupplyProductsSection
              items={items}
              units={units}
              receivedAt={receivedAt}
              submitted={submitted}
              onSelect={addProduct}
              onCreateProduct={setProductName}
              onChange={updateItem}
              onRemove={(id) =>
                setItems((current) => current.filter((item) => item.id !== id))
              }
              onAddUnit={setUnitFor}
              onScanUpd={() => setScanOpened(true)}
            />
          </fieldset>
        </form>
      </DefaultPageLayout>
      <ScanUpdModal
        opened={scanOpened}
        loading={scanning}
        onClose={() => setScanOpened(false)}
        onSubmit={async (file) => {
          const result = await scanSupplyUpd(file).unwrap();
          const drafts = toUpdSupplyDrafts(result.items);
          setItems((current) => [...current, ...drafts]);
          if (result.sellerName) setSupplier(result.sellerName);
          setSubmitted(false);
          setFormError(null);
          setScanOpened(false);
          showSuccess(
            "УПД распознан. Проверьте данные, укажите номер поставки и сроки годности.",
          );
        }}
      />
      <CreateProductModal
        opened={productName !== null}
        initialName={productName ?? ""}
        onClose={() => setProductName(null)}
      />
      <CreateUnitModal
        key={unitFor ?? "closed"}
        opened={unitFor !== null}
        units={units}
        onClose={() => setUnitFor(null)}
        onCreated={(unit: IUnit) => {
          if (unitFor) updateItem(unitFor, { unitId: unit.id });
          setUnitFor(null);
        }}
      />
    </>
  );
}
