import type { ProxyOptions } from "vite";

export function rewriteDevAuthCookie(cookie: string, secureClient: boolean): string {
  const [nameValue, ...attributes] = cookie.split(";");
  if (!/^(accessToken|refreshToken)=/.test(nameValue.trim())) return cookie;
  const name = nameValue.trim().split("=")[0];
  const kept = attributes.map(value => value.trim()).filter(value =>
    !/^(Domain|Path|SameSite)=/i.test(value) &&
    !/^HttpOnly$/i.test(value) &&
    (secureClient || !/^(Secure|Partitioned)$/i.test(value)),
  );
  // The browser owns cookies on the frontend host; only refresh needs the /api prefix.
  return [nameValue.trim(), ...kept, "HttpOnly", "SameSite=Lax",
    `Path=${name === "refreshToken" ? "/api/auth" : "/"}`].join("; ");
}

export function createDevApiProxy(target: string): Record<string, ProxyOptions> {
  const url = new URL(target, "http://invalid.local");
  if (!/^https?:\/\//.test(target) || !["http:", "https:"].includes(url.protocol)) {
    throw new Error("API_PROXY_TARGET must be an absolute HTTP(S) gateway URL");
  }
  return {
    "^/api(?:/|$)": {
      target,
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api(?=\/|$)/, "") || "/",
      proxyTimeout: 240_000,
      configure(proxy) {
        proxy.on("proxyRes", (response, request) => {
          const cookies = response.headers["set-cookie"];
          if (!cookies) return;
          const secureClient = Boolean((request.socket as { encrypted?: boolean }).encrypted);
          response.headers["set-cookie"] = cookies.map(cookie => rewriteDevAuthCookie(cookie, secureClient));
        });
      },
    },
    "/socket.io": { target: url.origin, changeOrigin: true, ws: true },
  };
}
