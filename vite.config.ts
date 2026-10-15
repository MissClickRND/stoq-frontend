import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { createDevApiProxy } from "./scripts/dev-api-proxy";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.API_PROXY_TARGET || env.VITE_API_URL || "http://localhost:3000";
  return {
  plugins: [react()],
  server: {
    proxy: createDevApiProxy(target),
    watch: { ignored: ["**/release/**"] },
  },
  resolve: {
    alias: {
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  };
});
