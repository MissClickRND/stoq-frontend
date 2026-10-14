import { baseApi } from "@/shared/api";
import type { DependencyGraph } from "../model/type.ts";

const emptyGraph: DependencyGraph = { nodes: [], edges: [] };
export const dependencyGraphApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDependencyGraph: build.query<DependencyGraph, void>({
      query: () => "/analytics/graph",
      providesTags: [
        { type: "Dish", id: "LIST" },
        { type: "Product", id: "LIST" },
        { type: "Store", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetDependencyGraphQuery } = dependencyGraphApi;

export function useDependencyGraph() {
  const query = useGetDependencyGraphQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  return { ...query, graph: query.currentData ?? emptyGraph };
}
