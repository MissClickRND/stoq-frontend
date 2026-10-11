import { createContext, useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { createMockSupplies, initialUnits } from "./data";
import type { Supply } from "./type";

type SuppliesContextValue = {
  supplies: Supply[];
  units: string[];
  addSupply: (supply: Omit<Supply, "id">) => void;
  addUnit: (name: string) => void;
};
const SuppliesContext = createContext<SuppliesContextValue | null>(null);

export function SuppliesRoutesLayout() {
  const [supplies, setSupplies] = useState(createMockSupplies);
  const [units, setUnits] = useState(initialUnits);
  const addSupply = (supply: Omit<Supply, "id">) => {
    setSupplies((current) => [
      {
        ...supply,
        id: `П-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      },
      ...current,
    ]);
  };
  const addUnit = (name: string) => setUnits((current) => [...current, name]);
  return (
    <SuppliesContext.Provider value={{ supplies, units, addSupply, addUnit }}>
      <Outlet />
    </SuppliesContext.Provider>
  );
}

export function useSupplies() {
  const context = useContext(SuppliesContext);
  if (!context) throw new Error("useSupplies requires SuppliesRoutesLayout");
  return context;
}
