import { getSupplyReportData, supplyReportColumns } from "../lib/report.ts";
import { supplyTotal } from "../lib/calculations.ts";
import type { ICreateSupplyRequest, ISupply, ScannedSupplyUpd } from "../model/type.ts";
import { normalizeArticle } from "@/shared/lib";
import { baseApi } from "@/shared/api/baseApi.ts";

export async function downloadSupplyReport(supply: ISupply): Promise<void> {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  await writeExcelFile(
    getSupplyReportData(supply, supplyTotal(supply)),
    {
      sheet: "Поставка",
      columns: supplyReportColumns,
      stickyRowsCount: 11,
      showGridLines: false,
      orientation: "landscape",
    },
    { fontFamily: "Calibri", fontSize: 12 },
  ).toFile(`Поставка_${normalizeArticle(supply.id)}.xlsx`);
}

export const suppliesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    scanSupplyUpd: build.mutation<ScannedSupplyUpd, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file);
        return { url: "/ai/supply", method: "POST", body, timeout: 210_000 };
      },
      invalidatesTags: (result) => result ? ["Product", "Unit"] : [],
    }),
    getSupplies: build.query<ISupply[], { search: string }>({
      query: ({ search }) => ({
        url: "/supplies",
        params: {
          search,
        },
      }),

      providesTags: [{ type: "Supply", id: "LIST" }],
    }),

    getSupplyById: build.query<ISupply, { id: number }>({
      query: ({ id }) => ({
        url: `/supplies/${id}`,
      }),

      providesTags: (_result, _error, arg) => [{ type: "Supply", id: arg.id }],
    }),

    createSupply: build.mutation<ISupply, ICreateSupplyRequest>({
      query: (data) => ({
        url: "/supplies",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supply", "Store", "Dish"],
    }),

    // deleteDish: build.mutation<void, { id: number }>({
    //   query: ({ id }) => ({
    //     url: `/dishes/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: (_result, _error, arg) => [
    //     { type: "Dish", id: "LIST" },
    //     { type: "Dish", id: arg.id },
    //   ],
    // }),
  }),
});

export const {
  useScanSupplyUpdMutation,
  useCreateSupplyMutation,
  useGetSuppliesQuery,
  useGetSupplyByIdQuery,
} = suppliesApi;
