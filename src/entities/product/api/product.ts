import { baseApi } from "@/shared/api";
import type {
  IProduct,
  IGetProductsRequest,
  ICreateProductRequest,
} from "../model/type";

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<IProduct[], IGetProductsRequest>({
      query: ({ search }) => ({
        url: "/product",
        params: {
          search,
        },
      }),

      providesTags: [{ type: "Product", id: "LIST" }],
    }),

    getProductById: build.query<IProduct, { id: number }>({
      query: ({ id }) => ({
        url: `/product/${id}`,
      }),

      providesTags: (_result, _error, arg) => [{ type: "Product", id: arg.id }],
    }),

    createProduct: build.mutation<IProduct, ICreateProductRequest>({
      query: (data) => ({
        url: "/product",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    createManyProduct: build.mutation<IProduct[], ICreateProductRequest[]>({
      query: (data) => ({
        url: "/product/few",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    deleteProduct: build.mutation<void, number>({
      query: (id) => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
} = productApi;
