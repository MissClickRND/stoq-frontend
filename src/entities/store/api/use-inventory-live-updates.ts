import { useEffect, useRef } from "react";
import { useStore } from "react-redux";
import { io } from "socket.io-client";
import { notifications } from "@mantine/notifications";
import { useAppDispatch, useAppSelector } from "@/shared/lib/store";
import { matchesStoreProduct } from "../lib/search";
import { storeApi } from "./store";
import { createInventorySubscription } from "./inventory-socket";

export function useInventoryLiveUpdates() {
  const dispatch = useAppDispatch();
  const reduxStore = useStore<RootState>();
  const subscription = useRef<ReturnType<typeof createInventorySubscription> | null>(null);
  const thresholdsKey = useAppSelector((state) =>
    storeApi.util.selectCachedArgsForQuery(state, "getExpiringStore")
      .map((arg) => arg.daysThreshold).sort((a, b) => a - b).join(","),
  );

  useEffect(() => {
    let disposed = false;
    let stockRevision = 0;
    const expiryRevisions = new Map<number, number>();
    const url = new URL(
      import.meta.env.VITE_WEBSOCKET_API_URL || import.meta.env.VITE_API_URL || "http://localhost:3000",
      window.location.origin,
    );
    url.pathname = "/inventory";
    url.search = "";
    url.hash = "";
    const socket = io(url.toString(), { transports: ["websocket"], withCredentials: true, autoConnect: false });
    const active = createInventorySubscription({
      socket,
      async onStock(data, changed) {
        const revision = ++stockRevision;
        const state = reduxStore.getState();
        // Finish older HTTP reads before applying the newer event snapshot.
        await Promise.all([
          ...storeApi.util.selectCachedArgsForQuery(state, "getStore")
            .map((arg) => dispatch(storeApi.util.getRunningQueryThunk("getStore", arg))),
          ...storeApi.util.selectCachedArgsForQuery(state, "getStoreProductById")
            .map((arg) => dispatch(storeApi.util.getRunningQueryThunk("getStoreProductById", arg))),
        ]);
        if (disposed || revision !== stockRevision) return;
        const current = reduxStore.getState();
        dispatch(storeApi.util.upsertQueryEntries(
          storeApi.util.selectCachedArgsForQuery(current, "getStore").map((arg) => ({
            endpointName: "getStore" as const, arg,
            value: data.filter((batch) => matchesStoreProduct(batch, arg.search)),
          })),
        ));
        dispatch(storeApi.util.upsertQueryEntries(
          storeApi.util.selectCachedArgsForQuery(current, "getStoreProductById").map((arg) => ({
            endpointName: "getStoreProductById" as const, arg,
            value: data.filter((batch) => batch.productId === arg.id),
          })),
        ));
        if (changed) dispatch(storeApi.util.invalidateTags(["Dish", "Supply", "Statistic"]));
      },
      async onExpiring(daysThreshold, data) {
        const revision = (expiryRevisions.get(daysThreshold) ?? 0) + 1;
        expiryRevisions.set(daysThreshold, revision);
        const arg = { daysThreshold };
        await dispatch(storeApi.util.getRunningQueryThunk("getExpiringStore", arg));
        if (disposed || expiryRevisions.get(daysThreshold) !== revision) return;
        const cached = storeApi.util.selectCachedArgsForQuery(reduxStore.getState(), "getExpiringStore");
        if (cached.some((entry) => entry.daysThreshold === daysThreshold)) {
          dispatch(storeApi.util.upsertQueryEntries([{ endpointName: "getExpiringStore", arg, value: data }]));
        }
      },
      onNotification(notice) {
        notifications.show({
          id: notice.id,
          title: "Склад",
          message: notice.message,
          color: { warning: "orange", error: "red", success: "green", info: "blue" }[notice.severity],
          position: "top-right",
          autoClose: 7000,
        });
      },
      onError(message) {
        notifications.show({ id: "inventory:connection", title: "Обновление склада", message,
          color: "orange", position: "top-right", autoClose: 5000 });
      },
    });
    subscription.current = active;
    return () => {
      disposed = true;
      subscription.current = null;
      active.dispose();
    };
  }, [dispatch, reduxStore]);

  useEffect(() => {
    subscription.current?.setDaysThresholds(thresholdsKey ? thresholdsKey.split(",").map(Number) : []);
  }, [thresholdsKey]);
}
