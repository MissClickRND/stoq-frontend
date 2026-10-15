import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import protocol from "../electron/protocol.cjs";

const { isTrustedUrl, isNetworkRequest, isGuestRequest, resolveAppFile, contentSecurityPolicy } = protocol;

test("desktop navigation stays on its own origin, including development", () => {
  assert.ok(isTrustedUrl("https://lyaguh.site/orders/new"));
  assert.ok(isTrustedUrl("http://127.0.0.1:5174/orders", true));
  for (const url of [
    "https://example.com",
    "file:///etc/passwd",
    "stoq://other/orders",
    "stoq://user@app/orders",
    "https://user@lyaguh.site/orders",
    "https://lyaguh.site.evil.test/orders",
    "http://lyaguh.site/orders",
    "not a URL",
  ])
    assert.equal(isTrustedUrl(url), false);
  assert.equal(isTrustedUrl("http://127.0.0.1:5173/orders", true), false);
});

test("API and Socket.IO use native networking rather than packaged SPA files", () => {
  for (const pathname of ["/api", "/api/auth/login", "/api/auth/refresh", "/socket.io/?transport=polling"])
    assert.ok(isNetworkRequest("https://lyaguh.site" + pathname));
  for (const pathname of ["/orders", "/assets/app.js", "/api-example", "/socket.io-example"])
    assert.equal(isNetworkRequest("https://lyaguh.site" + pathname), false);
});

test("forwarding keeps public guest queries anonymous and staff orders authenticated", () => {
  const request = (pathname, method = "GET", headers = {}) => new Request("https://lyaguh.site" + pathname, { method, headers });
  assert.ok(isGuestRequest(request("/api/menu?search=soup")));
  assert.ok(isGuestRequest(request("/api/restaurants")));
  assert.ok(isGuestRequest(request("/api/test/restaurants")));
  assert.ok(isGuestRequest(request("/api/orders", "POST", { "X-Restaurant-Id": "7" })));
  assert.equal(isGuestRequest(request("/api/orders", "POST")), false);
  assert.equal(isGuestRequest(request("/api/auth/status")), false);
});

test("desktop serves assets and SPA deep links without exposing files outside dist", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "stoq-desktop-"));
  try {
    await mkdir(path.join(root, "assets"));
    await writeFile(path.join(root, "index.html"), "<main>STOQ</main>");
    await writeFile(path.join(root, "assets", "app.js"), "export {};");
    assert.equal(
      await resolveAppFile("https://lyaguh.site/assets/app.js?v=1", root),
      path.join(root, "assets", "app.js"),
    );
    assert.equal(
      await resolveAppFile("https://lyaguh.site/orders/new", root, true),
      path.join(root, "index.html"),
    );
    assert.equal(
      await resolveAppFile("https://lyaguh.site/dishes/dish.v2", root, true),
      path.join(root, "index.html"),
    );
    for (const url of [
      "https://lyaguh.site/%2e%2e%2fsecret.txt",
      "https://lyaguh.site/%5csecret.txt",
      "https://lyaguh.site/file%3Asecret",
      "https://lyaguh.site/%00",
      "https://lyaguh.site/%zz",
      "stoq://other/index.html",
      "https://lyaguh.site/assets/missing.js",
    ])
      assert.equal(await resolveAppFile(url, root), null, url);
  } finally {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(tmpdir()));
    await rm(root, { recursive: true, force: true });
  }
});

test("production CSP permits the existing theme bootstrap by hash, without unrestricted scripts", () => {
  const policy = contentSecurityPolicy(
    '<script>setTheme()</script><script src="/assets/app.js"></script>',
  );
  assert.match(policy, /script-src 'self' 'sha256-/);
  assert.doesNotMatch(
    policy
      .split(";")
      .find((directive) => directive.trim().startsWith("script-src")),
    /unsafe-inline|unsafe-eval/,
  );
  assert.match(policy, /object-src 'none'/);
  assert.match(policy, /connect-src 'self' http: https: ws: wss:/);
});
