import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import protocol from "../electron/protocol.cjs";

const { isTrustedUrl, resolveAppFile, contentSecurityPolicy } = protocol;

test("desktop navigation stays on its own origin, including development", () => {
  assert.ok(isTrustedUrl("stoq://app/orders/new"));
  assert.ok(isTrustedUrl("http://127.0.0.1:5174/orders", true));
  for (const url of [
    "https://example.com",
    "file:///etc/passwd",
    "stoq://other/orders",
    "stoq://user@app/orders",
    "not a URL",
  ])
    assert.equal(isTrustedUrl(url), false);
  assert.equal(isTrustedUrl("http://127.0.0.1:5173/orders", true), false);
});

test("desktop serves assets and SPA deep links without exposing files outside dist", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "stoq-desktop-"));
  try {
    await mkdir(path.join(root, "assets"));
    await writeFile(path.join(root, "index.html"), "<main>STOQ</main>");
    await writeFile(path.join(root, "assets", "app.js"), "export {};");
    assert.equal(
      await resolveAppFile("stoq://app/assets/app.js?v=1", root),
      path.join(root, "assets", "app.js"),
    );
    assert.equal(
      await resolveAppFile("stoq://app/orders/new", root, true),
      path.join(root, "index.html"),
    );
    assert.equal(
      await resolveAppFile("stoq://app/dishes/dish.v2", root, true),
      path.join(root, "index.html"),
    );
    for (const url of [
      "stoq://app/%2e%2e%2fsecret.txt",
      "stoq://app/%5csecret.txt",
      "stoq://app/file%3Asecret",
      "stoq://app/%00",
      "stoq://app/%zz",
      "stoq://other/index.html",
      "stoq://app/assets/missing.js",
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
});
