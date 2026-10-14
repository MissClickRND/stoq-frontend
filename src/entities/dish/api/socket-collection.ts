import type { Socket } from "socket.io-client";

export type SocketCollectionState<T> = {
  data: T[] | undefined;
  isFetching: boolean;
  error: string | null;
};

export function createSocketCollection<T>({
  socket,
  requestEvent,
  resultEvent,
  requestId,
  initialSearch,
  onChange,
  timeoutMs = 30_000,
}: {
  socket: Socket;
  requestEvent: string;
  resultEvent: string;
  requestId: string;
  initialSearch?: string;
  onChange: (state: SocketCollectionState<T>) => void;
  timeoutMs?: number;
}) {
  let state: SocketCollectionState<T> = {
    data: undefined,
    isFetching: true,
    error: null,
  };
  let search = initialSearch;
  let revision = 0;
  let pendingRevision: number | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  function publish(patch: Partial<SocketCollectionState<T>>) {
    if (disposed) return;
    state = { ...state, ...patch };
    onChange(state);
  }

  function clearTimer() {
    clearTimeout(timer);
    timer = undefined;
  }

  function waitForResponse() {
    clearTimer();
    timer = setTimeout(() => {
      // Closing the connection discards delayed responses with the same ID.
      socket.disconnect();
      pendingRevision = null;
      publish({
        isFetching: false,
        error: "Сервер не ответил вовремя. Повторите запрос.",
      });
    }, timeoutMs);
  }

  function send() {
    if (disposed || !socket.connected || pendingRevision !== null) return;
    pendingRevision = revision;
    publish({ isFetching: true, error: null });
    waitForResponse();
    socket.emit(requestEvent, {
      requestId,
      ...(search === undefined ? {} : { search }),
    });
  }

  function finish(
    response: { requestId: string; data?: T[]; message?: string },
    failed = false,
  ) {
    if (
      disposed ||
      response?.requestId !== requestId ||
      pendingRevision === null
    )
      return;
    const receivedRevision = pendingRevision;
    pendingRevision = null;
    clearTimer();
    if (receivedRevision !== revision) {
      send();
      return;
    }
    if (failed || !Array.isArray(response.data)) {
      publish({
        isFetching: false,
        error: response.message || "Не удалось загрузить список.",
      });
    } else {
      publish({ data: response.data, isFetching: false, error: null });
    }
  }

  const onResult = (response: { requestId: string; data: T[] }) =>
    finish(response);
  const onError = (response: { requestId: string; message: string }) =>
    finish(response, true);
  const onConnect = () => send();
  const onConnectError = (error: Error) => {
    clearTimer();
    publish({
      isFetching: false,
      error: `Не удалось подключиться: ${error.message}`,
    });
  };
  const onDisconnect = () => {
    clearTimer();
    pendingRevision = null;
    publish({ isFetching: false, error: "Соединение с сервером прервано." });
  };

  function refetch() {
    if (disposed) return;
    revision++;
    publish({ isFetching: true, error: null });
    if (socket.connected) send();
    else {
      waitForResponse();
      socket.connect();
    }
  }

  const onUpdated = () => refetch();
  socket.on("connect", onConnect);
  socket.on("connect_error", onConnectError);
  socket.on("disconnect", onDisconnect);
  socket.on(resultEvent, onResult);
  socket.on("recommendations:error", onError);
  socket.on("recommendations:stopListUpdated", onUpdated);
  publish({});
  waitForResponse();
  if (socket.connected) send();
  else socket.connect();

  return {
    refetch,
    setSearch(next: string | undefined) {
      if (disposed || next === search) return;
      search = next;
      publish({ data: undefined });
      refetch();
    },
    dispose() {
      disposed = true;
      clearTimer();
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
      socket.off(resultEvent, onResult);
      socket.off("recommendations:error", onError);
      socket.off("recommendations:stopListUpdated", onUpdated);
      socket.disconnect();
    },
  };
}
