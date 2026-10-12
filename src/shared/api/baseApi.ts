import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Product",
    "Supply",
    "SupplyItem",
    "Unit",
    "Order",
    "Dish",
  ],
  endpoints: () => ({}),
});
