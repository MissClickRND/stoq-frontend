import type { IExpiringStoreProduct, IStoreProduct } from "../model/type.ts";

type Controls = { stock: () => void; expiring: (days: number) => void };
type Waiter<T> = { resolve: (data: T) => void; reject: (error: Error) => void };

export function createInventorySocketCache() {
  let stock: IStoreProduct[] | undefined;
  const expiry = new Map<number, IExpiringStoreProduct[]>();
  let controls: Controls | undefined;
  let error: Error | undefined;
  const stockWaiters = new Set<Waiter<IStoreProduct[]>>();
  const expiryWaiters = new Map<number, Set<Waiter<IExpiringStoreProduct[]>>>();

  function wait<T>(waiters: Set<Waiter<T>>, signal?: AbortSignal): Promise<T> {
    return new Promise((resolve, reject) => {
      const cleanup = () => { clearTimeout(timer); signal?.removeEventListener("abort", abort); waiters.delete(waiter); };
      const waiter = { resolve(data: T) { cleanup(); resolve(data); }, reject(reason: Error) { cleanup(); reject(reason); } };
      const abort = () => waiter.reject(new Error("Загрузка отменена"));
      const timer = setTimeout(() => waiter.reject(new Error("Склад не ответил. Повторите загрузку.")), 30000);
      waiters.add(waiter);
      signal?.addEventListener("abort", abort, { once: true });
      if (signal?.aborted) abort();
    });
  }
  return {
    attach(next: Controls) { controls = next; error = undefined; },
    readStock(signal?: AbortSignal): Promise<IStoreProduct[]> {
      const result = stock ? Promise.resolve(stock) : error ? Promise.reject(error) : wait(stockWaiters, signal);
      controls?.stock();
      return result;
    },
    readExpiring(days: number, signal?: AbortSignal): Promise<IExpiringStoreProduct[]> {
      if (!expiryWaiters.has(days)) expiryWaiters.set(days, new Set());
      const result = expiry.has(days) ? Promise.resolve(expiry.get(days)!)
        : error ? Promise.reject(error) : wait(expiryWaiters.get(days)!, signal);
      controls?.expiring(days);
      return result;
    },
    setStock(data: IStoreProduct[]) {
      stock = data; error = undefined;
      for (const waiter of [...stockWaiters]) waiter.resolve(data);
    },
    setExpiring(days: number, data: IExpiringStoreProduct[]) {
      expiry.set(days, data); error = undefined;
      for (const waiter of [...(expiryWaiters.get(days) ?? [])]) waiter.resolve(data);
    },
    fail(message: string) {
      error = new Error(message);
      for (const waiter of [...stockWaiters]) waiter.reject(error);
      for (const waiters of expiryWaiters.values()) for (const waiter of [...waiters]) waiter.reject(error);
    },
    reset() {
      this.fail("Подключение к складу закрыто");
      stock = undefined; expiry.clear(); controls = undefined; error = undefined;
    },
  };
}
export const inventorySocketCache = createInventorySocketCache();
