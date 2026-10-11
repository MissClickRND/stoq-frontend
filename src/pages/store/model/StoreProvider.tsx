import { createContext, useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { initialStoreProducts } from "./table-data";
import { applyInventoryToProducts } from "./inventory";
import type { InventoryEntry } from "./inventory-type";
import type { StoreProduct } from "./type";

type StoreContextValue = {
  products: StoreProduct[];
  removeProduct: (id: string) => void;
  applyInventory: (entries: InventoryEntry[]) => void;
};
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreRoutesLayout() {
  const [products, setProducts] =
    useState<StoreProduct[]>(initialStoreProducts);
  const removeProduct = (id: string) =>
    setProducts((current) => current.filter((product) => product.id !== id));
  const applyInventory = (entries: InventoryEntry[]) =>
    setProducts((current) => applyInventoryToProducts(current, entries));
  return (
    <StoreContext.Provider value={{ products, removeProduct, applyInventory }}>
      <Outlet />
    </StoreContext.Provider>
  );
}

export function useStoreProducts() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStoreProducts requires StoreRoutesLayout");
  return context;
}
