import type { Socket } from "socket.io-client";
import type { IExpiringStoreProduct, IStoreProduct } from "../model/type.ts";

export type InventoryNotification = {
  id: string;
  message: string;
  severity: "warning" | "error" | "success" | "info";
};
type InventoryEvent = {
  eventId?: string;
  reason?: string;
  data?: IStoreProduct[];
  message?: string;
  notifications?: {
    productId: number;
    message: string;
    severity?: InventoryNotification["severity"];
  }[];
};

export function createInventorySubscription({
  socket, onStock, onExpiring, onNotification, onError, timeoutMs = 30_000,
}: {
  socket: Socket;
  onStock: (data: IStoreProduct[], changed: boolean) => void;
  onExpiring: (daysThreshold: number, data: IExpiringStoreProduct[]) => void;
  onNotification: (notification: InventoryNotification) => void;
  onError: (message: string) => void;
  timeoutMs?: number;
}) {
  let disposed = false;
  let revision = 0;
  let pendingStock: number | null = null;
  let reloadStock = false;
  let sequence = 0;
  let thresholds: number[] = [];
  const pendingExpiry = new Map<number, string>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const seenEvents = new Set<string>();
  const seenSnapshots = new Set<string>();
  const seenNotices = new Set<string>();

  function remember(set: Set<string>, id: string | undefined) {
    if (!id) return false;
    if (set.has(id)) return true;
    set.add(id);
    if (set.size > 200) set.delete(set.values().next().value!);
    return false;
  }
  function clearTimer(id: string) {
    clearTimeout(timers.get(id));
    timers.delete(id);
  }
  function wait(id: string) {
    clearTimer(id);
    timers.set(id, setTimeout(() => {
      timers.delete(id);
      if (id === "store") pendingStock = null;
      for (const [days, requestId] of pendingExpiry) {
        if (requestId === id) pendingExpiry.delete(days);
      }
      if (!disposed) onError("Склад не ответил вовремя. Данные обновятся после восстановления соединения.");
    }, timeoutMs));
  }
  function requestStock() {
    if (disposed || !socket.connected || pendingStock !== null) return;
    pendingStock = revision;
    reloadStock = false;
    wait("store");
    socket.emit("inventory:getStock", { requestId: "store" });
  }
  function requestExpiry(daysThreshold: number) {
    if (disposed || !socket.connected) return;
    const previous = pendingExpiry.get(daysThreshold);
    if (previous) clearTimer(previous);
    const requestId = `store:expiring:${daysThreshold}:${++sequence}`;
    pendingExpiry.set(daysThreshold, requestId);
    wait(requestId);
    socket.emit("inventory:getExpiringSoon", { requestId, daysThreshold });
  }
  function isSnapshot(data: unknown): data is IStoreProduct[] {
    return Array.isArray(data) && data.every((batch) => batch &&
      Number.isSafeInteger(batch.id) && batch.id > 0 &&
      Number.isSafeInteger(batch.supplyId) && Number.isSafeInteger(batch.productId));
  }
  const onStockResult = (response: { requestId?: string; data?: unknown }) => {
    if (disposed || response?.requestId !== "store" || pendingStock === null) return;
    const requestedRevision = pendingStock;
    pendingStock = null;
    clearTimer("store");
    if (requestedRevision !== revision) {
      if (reloadStock) requestStock();
      return;
    }
    if (isSnapshot(response.data)) onStock(response.data, false);
    else onError("Ответ склада не содержит данные складских партий.");
  };
  const onExpiringResult = (response: { requestId?: string; data?: IExpiringStoreProduct[] }) => {
    if (disposed || !response?.requestId) return;
    for (const [days, requestId] of pendingExpiry) {
      if (requestId !== response.requestId) continue;
      pendingExpiry.delete(days);
      clearTimer(requestId);
      if (Array.isArray(response.data)) onExpiring(days, response.data);
      else onError("Не удалось получить партии с истекающим сроком годности.");
      break;
    }
  };
  const onChanged = (event: InventoryEvent) => {
    if (disposed || !event || typeof event !== "object") return;
    const repeated = remember(seenEvents, event.eventId);
    const hasSnapshot = isSnapshot(event.data);
    const newSnapshot = hasSnapshot && !remember(seenSnapshots, event.eventId);
    if (!repeated || newSnapshot) revision++;
    if (newSnapshot) {
      reloadStock = false;
      onStock(event.data!, true);
    } else if (!repeated) {
      if (!hasSnapshot) {
        reloadStock = true;
        requestStock();
      }
    }
    if (!repeated || newSnapshot) thresholds.forEach(requestExpiry);
    const notices = Array.isArray(event.notifications)
      ? event.notifications.filter((notice) => notice && typeof notice.message === "string" && notice.message.trim())
      : [];
    const hasMessage = typeof event.message === "string" && event.message.trim();
    if ((!notices.length && !hasMessage) || remember(seenNotices, event.eventId)) return;
    if (notices.length) {
      const shown = new Set<string>();
      for (const notice of notices) {
        const key = `${notice.productId}:${notice.message}`;
        if (shown.has(key)) continue;
        shown.add(key);
        onNotification({ id: `inventory:${event.eventId ?? ++sequence}:${notice.productId}`,
          message: notice.message, severity: notice.severity ?? "warning" });
      }
    } else if (typeof event.message === "string" && event.message.trim()) {
      onNotification({ id: `inventory:${event.eventId ?? ++sequence}`,
        message: event.message, severity: "info" });
    }
  };
  const onServerError = (response: { requestId?: string; message?: string }) => {
    if (disposed || !response?.requestId) return;
    if (response.requestId === "store" && pendingStock !== null) pendingStock = null;
    else {
      const entry = [...pendingExpiry].find(([, id]) => id === response.requestId);
      if (!entry) return;
      pendingExpiry.delete(entry[0]);
    }
    clearTimer(response.requestId);
    onError(response.message || "Не удалось обновить склад.");
  };
  const onDisconnect = () => {
    for (const id of timers.keys()) clearTimer(id);
    pendingStock = null;
    pendingExpiry.clear();
  };
  const onConnect = () => {
    onDisconnect();
    requestStock();
    thresholds.forEach(requestExpiry);
  };
  const onConnectError = (error: Error) => {
    if (!disposed) onError(`Не удалось подключиться к складу: ${error.message}`);
  };
  const listeners = {
    connect: onConnect,
    disconnect: onDisconnect,
    connect_error: onConnectError,
    "inventory:stockResult": onStockResult,
    "inventory:expiringSoonResult": onExpiringResult,
    "inventory:stockChanged": onChanged,
    "inventory:batchExpired": onChanged,
    "inventory:error": onServerError,
  };
  for (const [event, handler] of Object.entries(listeners)) socket.on(event, handler);
  if (socket.connected) onConnect();
  else socket.connect();

  return {
    setDaysThresholds(next: number[]) {
      const previous = thresholds;
      thresholds = [...new Set(next.filter((days) => Number.isFinite(days) && days >= 0))];
      for (const [days, id] of pendingExpiry) {
        if (!thresholds.includes(days)) { clearTimer(id); pendingExpiry.delete(days); }
      }
      thresholds.filter((days) => !previous.includes(days)).forEach(requestExpiry);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      onDisconnect();
      for (const [event, handler] of Object.entries(listeners)) socket.off(event, handler);
      socket.disconnect();
    },
  };
}
