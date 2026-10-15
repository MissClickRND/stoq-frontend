type ConnectionEnvironment = {
  DEV?: boolean;
  VITE_API_URL?: string;
  VITE_WEBSOCKET_API_URL?: string;
};

export function getApiBaseUrl(env: ConnectionEnvironment = import.meta.env ?? {}): string {
  return env.DEV ? "/api" : env.VITE_API_URL || "http://localhost:3000";
}

export function getSocketUrl(
  namespace: string,
  origin: string = window.location.origin,
  env: ConnectionEnvironment = import.meta.env ?? {},
): string {
  const address = env.DEV ? origin
    : env.VITE_WEBSOCKET_API_URL || env.VITE_API_URL || "http://localhost:3000";
  const url = new URL(address, origin);
  url.pathname = namespace;
  url.search = "";
  url.hash = "";
  return url.toString();
}
