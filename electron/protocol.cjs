const { stat } = require("node:fs/promises");
const path = require("node:path");
const { createHash } = require("node:crypto");

const APP_URL = "https://lyaguh.site/";
const DEV_URL = "http://127.0.0.1:5174";

function isTrustedUrl(value, development = false) {
  try {
    const url = new URL(value);
    const trusted = new URL(development ? DEV_URL : APP_URL);
    return (
      !url.username &&
      !url.password &&
      url.protocol === trusted.protocol &&
      url.host === trusted.host
    );
  } catch {
    return false;
  }
}

// Keep packaged pages on the API's site so Chromium can use SameSite cookies.
// Only UI files are intercepted; API and Socket.IO retain native networking.
function isNetworkRequest(value) {
  const { pathname } = new URL(value);
  return /^\/(api|socket\.io)(\/|$)/.test(pathname);
}

function isGuestRequest(request) {
  const { pathname } = new URL(request.url);
  return ["/api/menu", "/api/restaurants", "/api/test/restaurants"].includes(pathname)
    || (pathname === "/api/orders" && request.method === "POST"
      && request.headers.has("X-Restaurant-Id"));
}

async function resolveAppFile(value, root, navigation = false) {
  if (!isTrustedUrl(value)) return null;
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(value).pathname);
  } catch {
    return null;
  }
  // Also reject Windows separators/alternate data streams after URL decoding.
  if (/[\\\0:]/.test(pathname)) return null;
  const file = path.resolve(root, "." + pathname);
  const relative = path.relative(root, file);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  try {
    if ((await stat(file)).isFile()) return file;
  } catch (error) {
    if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
  }
  // BrowserRouter deep links use index.html; missing assets must stay 404s.
  return navigation ? path.join(root, "index.html") : null;
}

function contentSecurityPolicy(html) {
  const scripts = [
    ...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi),
  ].map(
    (match) =>
      `'sha256-${createHash("sha256").update(match[1]).digest("base64")}'`,
  );
  return [
    "default-src 'self'",
    `script-src 'self' ${scripts.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' http: https: ws: wss:",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

module.exports = {
  APP_URL,
  DEV_URL,
  isTrustedUrl,
  isNetworkRequest,
  isGuestRequest,
  resolveAppFile,
  contentSecurityPolicy,
};
