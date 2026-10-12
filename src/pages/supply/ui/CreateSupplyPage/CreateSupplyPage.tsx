import componentClasses from "./CreateSupplyPage.module.css";
import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import {
  useSupplies,
  calculateItemPrices,
  validateItem,
  type SupplyItemDraft,
  type Product,
} from "@/entities/supply";
import { useUnits } from "@/entities/unit";

import { CreateProductModal } from "@/widgets/create-product-modal";
import { CreateUnitModal } from "../components/CreateUnitModal";
import { SupplyDeliveryFields } from "../components/SupplyDeliveryFields";
import { SupplySummary } from "../components/SupplySummary/SupplySummary";
import { SupplyProductsSection } from "../components/SupplyProductsSection/SupplyProductsSection";

export function CreateSupplyPage() {
  const { addSupply } = useSupplies();
  const { units, addUnit } = useUnits();
  const employeeName = useSelector((state: RootState) => state.user.name);
  const [receivedAt, setReceivedAt] = useState<string | null>(() =>
    dayjs().format("YYYY-MM-DD HH:mm:ss"),
  );
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<SupplyItemDraft[]>([]);
  const [unitFor, setUnitFor] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const total = items.reduce(
    (sum, item) => sum + calculateItemPrices(item).total,
    0,
  );
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
        unit: product.unit,
        expiresAt: null,
        price: product.price,
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

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!receivedAt || !supplier.trim())
      return setFormError("Заполните дату поступления и поставщика.");
    if (!items.length)
      return setFormError("Добавьте хотя бы один продукт в поставку.");
    const invalid = items.find(
      (item) => Object.keys(validateItem(item, receivedAt)).length > 0,
    );
    if (invalid) {
      setFormError("Проверьте поля продукта «" + invalid.product.title + "».");
      document
        .getElementById("supply-item-" + invalid.id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addSupply({
      supplier: supplier.trim(),
      receivedAt,
      acceptedBy: employeeName || "Пользователь",
      items: items.map((item) => ({
        id: item.id,
        product: item.product,
        quantity: Number(item.quantity),
        unit: item.unit,
        expiresAt: item.expiresAt!,
        ...calculateItemPrices(item),
      })),
    });
    //! Показывать успех и переходить к списку только после ответа сервера.
  };

  return (
    <>
      <DefaultPageLayout
        title="Создание поставки"
        subtitle="Добавьте продукты, укажите количество, цены и сроки годности"
        disableSearch
        disableStatistics
        headerTopSection={
          <PageBreadcrumbs
            parentLabel="Поставки"
            parentPath="/supply"
            currentLabel="Создание поставки"
          />
        }
      >
        <form onSubmit={submit} className={componentClasses.form} noValidate>
          <div className={componentClasses.topSections}>
            <SupplyDeliveryFields
              receivedAt={receivedAt}
              supplier={supplier}
              submitted={submitted}
              onDateChange={setReceivedAt}
              onSupplierChange={setSupplier}
            />
            <SupplySummary
              count={items.length}
              total={total}
              error={formError}
              onClearError={() => setFormError(null)}
            />
          </div>
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
          />
        </form>
      </DefaultPageLayout>
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
        onCreate={(name) => {
          addUnit(name);
          //! Обновить список единиц и выбрать созданную единицу после ответа сервера.
        }}
      />
    </>
  );
}
