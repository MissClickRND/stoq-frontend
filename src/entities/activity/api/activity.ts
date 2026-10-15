import { baseApi } from '@/shared/api';
import type { ActivityPage } from '../model/type';

export const activityApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getActivity: build.infiniteQuery<ActivityPage, void, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: last => last.nextCursor ?? undefined,
      },
      query: ({ pageParam }) => ({ url: '/logs', params: pageParam ? { cursor: pageParam } : undefined }),
      providesTags: ['Activity'],
    }),
  }),
});
export const { useGetActivityInfiniteQuery } = activityApi;
