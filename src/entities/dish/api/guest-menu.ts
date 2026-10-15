import { baseApi } from "@/shared/api";
import { toDish } from "../lib/adapters";
import type { Dish } from "../model/type";

export type GuestMenuDish = {
  id: number;
  name: string;
  category: string | null;
  salePrice: number | null;
  available: boolean;
  imageURL?: string | null;
  description?: string;
  recommended?: boolean;
  recommendationRank?: number | null;
};
export type GuestDish = Dish & { recommended: boolean; recommendationRank: number | null };
export function toGuestDish(source: GuestMenuDish): GuestDish {
  return {
    ...toDish(source),
    stopped: !source.available,
    availablePortions: source.available ? 1 : 0,
    recommended: source.recommended === true,
    recommendationRank: source.recommendationRank ?? null,
  };
}
export const guestMenuApi = baseApi.injectEndpoints({
  endpoints: build => ({
    guestMenu: build.query<GuestMenuDish[], { restaurantId: string; search: string }>({
      query: ({ restaurantId, search }) => ({
        url: "/menu", params: { search }, credentials: "omit",
        headers: { "X-Restaurant-Id": restaurantId },
      }),
      providesTags: (_result, _error, { restaurantId }) => [{ type: "Dish", id: `GUEST_MENU:${restaurantId}` }],
    }),
  }),
});
export function useGuestMenu(restaurantId: string, search = "") {
  const query = guestMenuApi.useGuestMenuQuery({ restaurantId, search });
  return { ...query, dishes: (query.currentData ?? []).map(toGuestDish) };
}
