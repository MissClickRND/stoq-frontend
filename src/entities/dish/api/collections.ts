import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { selectUser } from "../../user/@x/dish";
import { useAppSelector } from "@/shared/lib/store";
import { getSocketUrl } from "@/shared/api/connection";
import type { IRecommendedDishes, IStopListDish } from "../model/type";
import {
  createSocketCollection,
  type SocketCollectionState,
} from "./socket-collection";

const stopListEvents = {
  requestEvent: "recommendations:getStopList",
  resultEvent: "recommendations:stopListResult",
  requestId: "stopListId",
};
const recommendationEvents = {
  requestEvent: "recommendations:getDishRecommendations",
  resultEvent: "recommendations:dishRecommendationsResult",
  requestId: "recommendedListId",
};

function useSocketCollection<T>(
  events: typeof stopListEvents,
  search: string | undefined,
  skip: boolean,
) {
  const sessionRevision = useAppSelector(selectUser).sessionRevision;
  const [state, setState] = useState<SocketCollectionState<T>>({
    data: undefined,
    isFetching: true,
    error: null,
  });
  const collection = useRef<ReturnType<
    typeof createSocketCollection<T>
  > | null>(null);
  const searchRef = useRef(search);

  useEffect(() => {
    searchRef.current = search;
    collection.current?.setSearch(search);
  }, [search]);

  useEffect(() => {
    if (skip) return;
    const socket = io(getSocketUrl("/recommendations"), {
      transports: ["websocket"],
      autoConnect: false,
      withCredentials: true,
    });
    const subscription = createSocketCollection<T>({
      socket,
      ...events,
      initialSearch: searchRef.current,
      onChange: setState,
    });
    collection.current = subscription;
    return () => {
      collection.current = null;
      subscription.dispose();
    };
  }, [events, skip, sessionRevision]);

  const refetch = useCallback(() => collection.current?.refetch(), []);
  return {
    dishes: skip ? [] : (state.data ?? []),
    currentData: skip ? undefined : state.data,
    isFetching: !skip && state.isFetching,
    isLoading: !skip && state.isFetching && !state.data,
    isError: !skip && state.error !== null,
    error: state.error,
    refetch,
  };
}

export function useStopList(search = "", options?: { skip?: boolean }) {
  return useSocketCollection<IStopListDish>(
    stopListEvents,
    search,
    options?.skip ?? false,
  );
}

export function useDishRecommendations(options?: { skip?: boolean }) {
  return useSocketCollection<IRecommendedDishes>(
    recommendationEvents,
    undefined,
    options?.skip ?? false,
  );
}
