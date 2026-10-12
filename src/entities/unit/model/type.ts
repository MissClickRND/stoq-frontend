export type IUnit = {
  id: number;
  name: string;
  shortName: string;
  createdAt: string;
};

export type ICreateUnitRequest = Pick<IUnit, "name" | "shortName">;
