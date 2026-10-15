import { useEffect, useRef } from "react";
import { useStore } from "react-redux";
import { io } from "socket.io-client";
import { notifications } from "@mantine/notifications";
import { useAppDispatch, useAppSelector } from "@/shared/lib/store";
import { getSocketUrl } from "@/shared/api/connection";
import { matchesStoreProduct } from "../lib/search";
import { storeApi } from "./store";
import { createInventorySubscription } from "./inventory-socket";
import { inventorySocketCache } from "./socket-cache";

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
    const socket = io(getSocketUrl("/inventory"), { transports: ["websocket"], withCredentials: true, autoConnect: false });
    const active = createInventorySubscription({
      socket,
      async onStock(data, changed) {
        const revision = ++stockRevision;
        inventorySocketCache.setStock(data);
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
        if (!changed) dispatch(storeApi.util.invalidateTags(["Statistic"]));
        if (changed) dispatch(storeApi.util.invalidateTags(["Dish", "Supply", "Statistic"]));
      },
      async onExpiring(daysThreshold, data) {
        const revision = (expiryRevisions.get(daysThreshold) ?? 0) + 1;
        expiryRevisions.set(daysThreshold, revision);
        inventorySocketCache.setExpiring(daysThreshold, data);
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
          autoClose: 3000,
        });
      },
      onError(message) {
        inventorySocketCache.fail(message);
      },
    });
    inventorySocketCache.attach({ stock: active.refreshStock, expiring: active.refreshExpiring });
    subscription.current = active;
    return () => {
      disposed = true;
      subscription.current = null;
      active.dispose();
      inventorySocketCache.reset();
    };
  }, [dispatch, reduxStore]);

  useEffect(() => {
    subscription.current?.setDaysThresholds(thresholdsKey ? thresholdsKey.split(",").map(Number) : []);
  }, [thresholdsKey]);
}
