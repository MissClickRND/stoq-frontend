import type { IProduct } from "../model/type.ts";

export type Product = Pick<IProduct, "id" | "name" | "unitId"> & {
  unit: Pick<IProduct["unit"], "id" | "name" | "shortName">;
};
