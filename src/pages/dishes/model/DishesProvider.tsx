import { createContext, useContext, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { initialDishes } from "./data";
import type { Dish, DishDraft } from "./type";

type DishesContextValue = {
  dishes: Dish[];
  saveDish: (draft: DishDraft, id?: string) => string;
  archiveDish: (id: string) => void;
};
const DishesContext = createContext<DishesContextValue | null>(null);

function DishesProvider({ children }: { children: ReactNode }) {
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const saveDish = (draft: DishDraft, id?: string) => {
    const dishId = id ?? crypto.randomUUID();
    setDishes((current) =>
      id
        ? current.map((dish) => (dish.id === id ? { ...dish, ...draft } : dish))
        : [...current, { ...draft, id: dishId, sales: [] }],
    );
    return dishId;
  };
  const archiveDish = (id: string) =>
    setDishes((current) =>
      current.map((dish) =>
        dish.id === id ? { ...dish, archived: true } : dish,
      ),
    );
  return (
    <DishesContext.Provider value={{ dishes, saveDish, archiveDish }}>
      {children}
    </DishesContext.Provider>
  );
}

export function useDishes() {
  const context = useContext(DishesContext);
  if (!context) throw new Error("useDishes requires DishesProvider");
  return context;
}

export function DishesRoutesLayout() {
  return (
    <DishesProvider>
      <Outlet />
    </DishesProvider>
  );
}
