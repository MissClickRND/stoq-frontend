import { baseApi } from "@/shared/api";
import { toDish } from "../lib/adapters";
import type { Dish } from "../model/type";

export type GuestMenuDish = { id: number; name: string; category: string | null; salePrice: number | null; available: boolean };
export function toGuestDish(source: GuestMenuDish): Dish {
  return { ...toDish(source), stopped: !source.available, availablePortions: source.available ? 1 : 0 };
}
export const guestMenuApi = baseApi.injectEndpoints({
  endpoints: build => ({
    guestMenu: build.query<GuestMenuDish[], string>({
      query: search => ({ url: "/menu", params: { search }, credentials: "omit" }),
      providesTags: [{ type: "Dish", id: "GUEST_MENU" }],
    }),
  }),
});
export function useGuestMenu(search = "") {
  const query = guestMenuApi.useGuestMenuQuery(search);
  return { ...query, dishes: (query.data ?? []).map(toGuestDish) };
}
