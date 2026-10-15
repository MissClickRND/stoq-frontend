import { baseApi } from "@/shared/api";
import type {
  IProduct,
  IGetProductsRequest,
  ICreateProductRequest,
} from "../model/type";

type ProductResponse = Omit<IProduct, "unitId"> & { unitId?: number };

// Catalog GET responses provide the unit relation without the foreign-key field.
const normalizeProduct = (product: ProductResponse): IProduct => ({
  ...product,
  unitId: product.unitId ?? product.unit.id,
});

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<IProduct[], IGetProductsRequest>({
      query: ({ search }) => ({
        url: "/product",
        params: {
          search,
        },
      }),

      transformResponse: (products: ProductResponse[]) =>
        products.map(normalizeProduct),
      providesTags: [{ type: "Product", id: "LIST" }],
    }),

    getProductById: build.query<IProduct, { id: number }>({
      query: ({ id }) => ({
        url: `/product/${id}`,
      }),

      transformResponse: normalizeProduct,
      providesTags: (_result, _error, arg) => [{ type: "Product", id: arg.id }],
    }),

    createProduct: build.mutation<IProduct, ICreateProductRequest>({
      query: (data) => ({
        url: "/product",
        method: "POST",
        body: data,
      }),
      transformResponse: normalizeProduct,
      invalidatesTags: ["Statistic", "Activity", { type: "Product", id: "LIST" }],
    }),

    createManyProduct: build.mutation<IProduct[], ICreateProductRequest[]>({
      query: (data) => ({
        url: "/product/few",
        method: "POST",
        body: data,
      }),
      transformResponse: (products: ProductResponse[]) =>
        products.map(normalizeProduct),
      invalidatesTags: ["Statistic", "Activity", { type: "Product", id: "LIST" }],
    }),

    deleteProduct: build.mutation<void, number>({
      query: (id) => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Statistic", "Activity", { type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
} = productApi;
