import { baseApi } from "@/shared/api";
import type { RestaurantSettings } from "../model/type.ts";

export type PublicRestaurant = { id: number; name: string; address?: string | null };
export type RestaurantResponse = PublicRestaurant & { email?: string | null; phone?: string | null };
export const toRestaurantSettings = (restaurant: RestaurantResponse): RestaurantSettings => ({
  id: String(restaurant.id), name: restaurant.name, address: restaurant.address ?? "",
  email: restaurant.email ?? "", phone: restaurant.phone ?? "",
});
export const restaurantsApi = baseApi.injectEndpoints({
  endpoints: build => ({
    restaurants: build.query<PublicRestaurant[], void>({
      query: () => ({ url: "/restaurants", credentials: "omit" }),
    }),
    currentRestaurant: build.query<RestaurantSettings, void>({
      query: () => "/auth/admin/restaurant",
      transformResponse: toRestaurantSettings,
      providesTags: [{ type: "User", id: "RESTAURANT" }],
    }),
    saveRestaurant: build.mutation<RestaurantSettings, Partial<Pick<RestaurantSettings, "name" | "address" | "email" | "phone">>>({
      query: body => ({ url: "/auth/admin/restaurant", method: "PATCH", body }),
      transformResponse: toRestaurantSettings,
      invalidatesTags: [{ type: "User", id: "RESTAURANT" }],
    }),
  }),
});
export const { useRestaurantsQuery, useCurrentRestaurantQuery, useSaveRestaurantMutation } = restaurantsApi;
export function useGuestRestaurant(id: string | undefined) {
  const query = useRestaurantsQuery(undefined, { skip: !id });
  const match = query.currentData?.find(item => String(item.id) === id);
  return { restaurant: match ? { ...match, id: String(match.id), city: match.address ?? "" } : undefined,
    isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}
