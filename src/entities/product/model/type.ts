import type { IUnit } from "../../unit/@x/product";

export interface IProduct {
  id: number;
  name: string;
  unitId: number;
  unit: IUnit;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export type IGetProductsRequest = {
  search: string;
};

export type ICreateProductRequest = Pick<IProduct, "name" | "unitId">;
